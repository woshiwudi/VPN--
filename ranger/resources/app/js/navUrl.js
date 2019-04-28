/**
 * Created by Administrator on 2018/11/13.
 */
$(function(){
    const shell = require('electron').shell;
    $("#url_ul").on("click","li a",function(){
        var url = $(this).attr('data-url');
        shell.openExternal(url);
    });
});