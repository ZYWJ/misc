/**
 * batch transform image tool
 * 2015.7.31
 */
// forEach async library
var Array   = require('node-array');
var mkdirp  = require('mkdirp');
var http    = require('http');
var fs_e    = require('fs-extra');
var fs      = require('fs');
var path    = require('path');

// define database
var mysql      = require('mysql');
var pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'xxxx',
    database : 'xxx',
});

// table name map to the image folder name
var tableMapFolder = {
    'a' : 'type1',
    'b' : 'type2',
    'c' : 'type3',
};

// after the images is created, store new image path to database
function store(connection, tableName, path, id) {
    connection.query("update " + tableName + " set new_picture='" + path + "' where id=" + id, function(err, rows) {
        if (err) throw err;
        console.log(rows.message);
    });
}

// create new image under new path
function task(connection, tableName, row) {
    var re    = /.*?(\d{4})\/(\d{2})\/(\d{2})\/(.*)/;
    var reRes = re.exec(row.picture);
    var year  = reRes[1];
    var month = reRes[2];
    var day   = reRes[3];
    var file  = reRes[4];
    var newDir    = 'attachment/' + tableMapFolder[tableName] + '/' + year + '/' + month + '/' + day + '/';
    var storePath = newDir + file;
    newDir        = 'new/' + newDir;
    newPath       = newDir + file;

    try {
        mkdirp(newDir, function(err) {
            if (err)  console.log(err);
        });

    } catch(e) {
        if (e.code != 'EEXIST') {
            throw e; 
        } 
    }
    
    fs.exists(newPath, function (exists) {
        // do nothing, if exists in the new path
        if (exists) return;

        // copy the old path to new path
        fs_e.copySync(row.picture, newPath);
        store(connection, tableName, storePath, row.id);
    });
}

// download from the Web
function download(connection, tableName, row) {
    var url = "http://127.0.0.1/";
    url = url + row.picture; 

    mkdirp(path.dirname(row.picture), function(err) {
        if (err) throw err;

        http.get(url, function(res){
            var imgData = "";
            res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
            // chunk download
            res.on("data", function(chunk){
                imgData += chunk;
            }); 

            // when download is end
            res.on("end", function(){
                fs.writeFile(row.picture, imgData, "binary", function(err) {
                    if (err) throw err;

                    console.log('Download ' + row.picture);
                    task(connection, tableName, row);
                });
            }); 
        });
    });
}

// get the picture field value from table
function getPicValue(connection, tableName) {
    connection.query('select id, picture from ' + tableName, function(err, rows, fields) {
        for (i in rows) {
            if ( ! rows[i].picture) {
                continue; 
            }
            picture = rows[i].picture;
           
            // if the value is prefix by a domain, delete it
            var re = /^(.*?)\/(attachment.*)/;
            reRes = re.exec(picture);
            if (reRes != null) {
                picture = reRes[2];
                rows[i].picture = reRes[2];
            } 

            var re2  = /^\d{4}.*/;
            var re3 = /^\/\d{4}.*/;

            if (re2.test(picture)) {
                picture = 'attachment/' + picture; 

            } else if(re3.test(picture)) {
                picture = 'attachment' + picture; 
            }
            rows[i].picture = picture;

            // then determine the picture is under the old path
            // if not, download it
            if ( ! fs.existsSync(picture)) {
                download(connection, tableName, rows[i]) 

            } else {
                // copy the old file to new path
                task(connection, tableName, rows[i]); 
            }
        }
    });
}

// find table which has `picture` field in database
function findTables(connection, tableName) {
    var sql = 'show fields from ' + tableName;
    connection.query(sql, function(err, rows, fields) {
        if (err) throw err;
        
        for (i in rows) {
            if (rows[i].Field == 'picture') {
                getPicValue(connection, tableName);
                break;
            }
        }
    });
}

// connection database
pool.getConnection(function(err, connection) {
    connection.query('show tables', function(err, rows) {
        if (err) throw err;

        rows.forEachAsync(function(element, index, arr) {
            pool.getConnection(function(err, connection) {
                findTables(connection, element.Tables_in_yin); 
            });
        });
        connection.release();
    });
});

