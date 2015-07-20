select concat('ALTER TABLE`',table_schema,'`.`',table_name,'`ENGINE=InnoDB;')
from information_schema.tables
Where table_schema='tttt'
and ENGINE='MyISAM'
into outfile '/tmp/InnoBatchConvert.sql'
