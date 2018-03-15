if has("multi_byte") 
    " UTF-8 编码 
    set encoding=utf-8 
    set termencoding=utf-8 
    set formatoptions+=mM 
    set fencs=utf-8,gbk 
    if v:lang =~? '^/(zh/)/|/(ja/)/|/(ko/)' 
        set ambiwidth=double 
    endif 
    if has("win32") 
        source $VIMRUNTIME/delmenu.vim 
        source $VIMRUNTIME/menu.vim 
        language messages zh_CN.utf-8 
    endif 
else 
    echoerr "Sorry, this version of (g)vim was not compiled with +multi_byte" 
endif


set guioptions-=m
set guioptions-=T
set encoding=utf-8
set termencoding=utf-8
set fileencoding=utf-8
set fileencodings=utf-8
language messages zh_CN.utf-8
set fileformat=unix
set ts=4
set sw=4
set expandtab
set autoindent
set backupdir=~/.vimbak  ".~
set directory=~/.vimbak  ".swp

if has('gui_running')
    set nocompatible
    set nu!
    set cursorline
    colorscheme solarized
    set background=dark
    set wildmenu
    filetype on
    set guifont=Ubuntu\ Mono\ 14
    set gfw=Ubuntu\ Mono\ 12
    set guioptions-=r  "隐藏右侧滚动条
    set guioptions-=l  "隐藏左侧滚动条
    set guioptions-=L  "隐藏左侧滚动条,横向分割窗口时

    wincmd w
    autocmd VimEnter * wincmd w
    autocmd VimEnter * NERDTree  /home/dev/repository
    let Tlist_Show_One_File=1  
    let Tlist_Exit_OnlyWindow=1  
    let Tlist_Use_Right_Window=1  
endif

map <silent> <F2> :if &guioptions =~# 'T' <Bar>
        \set guioptions-=T <Bar>
        \set guioptions-=m <bar>
    \else <Bar>
        \set guioptions+=T <Bar>
        \set guioptions+=m <Bar>
    \endif<CR>
    
map <F3> :TlistToggle<CR>
map <C-F12> :!ctags -R --c++-kinds=+p --fields=+iaS --extra=+q /home/dev/repository/lua-5.1.5/<CR>  
if filereadable("cscope.out")
cs add cscope.out
" else add the database pointed to by environment variable
elseif $CSCOPE_DB  != ""
    cs add $CSCOPE_DB
endif
nmap <C-\>s :cs find s <C-R>=expand("<cword>")<CR><CR>          
nmap <C-\>g :cs find g <C-R>=expand("<cword>")<CR><CR>          
nmap <C-\>c :cs find c <C-R>=expand("<cword>")<CR><CR>                                                      
nmap <C-\>t :cs find t <C-R>=expand("<cword>")<CR><CR>                                                      
nmap <C-\>e :cs find e <C-R>=expand("<cword>")<CR><CR>          
nmap <C-\>f :cs find f <C-R>=expand("<cfile>")<CR><CR>          
nmap <C-\>i :cs find i ^<C-R>=expand("<cfile>")<CR>$<CR>
nmap <C-\>d :cs find d <C-R>=expand("<cword>")<CR><CR> 
