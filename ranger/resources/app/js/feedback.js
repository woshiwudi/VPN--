/**
 * Created by Administrator on 2018/11/13.
 */
$(function(){
    var img_url = '';
    $("#myIframe").attr("src",web+"/notice_pc.html").niceScroll({
        cursorcolor: "#ddd",//#CC0071 光标颜色
        cursoropacitymax:0.5, //改变不透明度非常光标处于活动状态（scrollabar“可见”状态），范围从1到0
        touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
        cursorwidth: "3px", //像素光标的宽度
        cursorborder: "0", // 游标边框css定义
        cursorborderradius: "5px",//以像素为光标边界半径
        autohidemode: 'scroll' //是否隐藏滚动条
    });
    $("#show_normal").click(function(){
        if($(this).text()=="展开>>"){
            $(this).text("收起");
        }else {
            $(this).text("展开>>");
        }
        $(this).parent().toggleClass('normal_hide');
        $(".feedback_ques").toggle();
    });
    $(document).unbind('keyup').bind("keyup",function(e){
        e = window.event || e;
        if(e.keyCode == 13){
            $('#quesSubmit').trigger("click");
        }
    });
    $("#quesSubmit").click(function(){
       submitLog(img_url)
    });
    $("#fileUp").change(function(){
        var objUrl = getObjectURL(this.files[0]) ;
        //console.log("objUrl = "+objUrl) ;
        if (objUrl)
        {
            $("#myImg").attr("src", objUrl);
        }
        var animateimg = $("#fileUp").val(); //获取上传的图片名 带//
        var imgarr=animateimg.split('\\'); //分割
        var myimg=imgarr[imgarr.length-1]; //去掉 // 获取图片名
        var houzui = myimg.lastIndexOf('.'); //获取 . 出现的位置
        var ext = myimg.substring(houzui, myimg.length).toUpperCase();  //切割 . 获取文件后缀
        var file = $('#fileUp').get(0).files[0]; //获取上传的文件
        //console.log(file);
        var fileSize = file.size;           //获取上传的文件大小
        var maxSize = 10485760;              //最大10MB
        if(ext !='.PNG' && ext !='.GIF' && ext !='.JPG' && ext !='.JPEG' && ext !='.BMP'){
            layer.msg('文件类型错误,请上传图片类型');
            return false;
        }else if(parseInt(fileSize) >= parseInt(maxSize)){
            layer.msg('上传的文件不能超过10MB');
            return false;
        }else{
            var formData = new FormData($('#myFileForm')[0]);
            var dateTime = Math.round(new Date().getTime()/1000).toString();
            var sign = getSign(formData,dateTime,salt);
            var token = localStorage.speedToken;
            var headobj = {
                'ts':dateTime,
                'sign':sign,
                'Authorization':token
            };
            var headers = $.extend(headobj,header);
            //console.log(formData);
            $('.loading').show();
            $.ajax({
                type:"POST",
                url: url + '/common/upload',
                data: formData,
                cache: false,
                processData: false,
                contentType : false,
                timeout: 10000,
                success: function (data) {
                    //console.log(data);
                    //console.log(JSON.parse(Mydecrypt(data)));
                    data = JSON.parse(Mydecrypt(data));
                    $('.loading').hide();
                    if(data.code == 200){
                        img_url = data.data.file_path;
                    }else if(data.code == 4003){
                        layer.msg(data.msg);
                        logOut();
                    }else {
                        layer.msg(data.msg);
                    }
                },
                error: function (data) {
                    $('.loading').hide();
                    layer.msg('出错了！');
                }
            });
        }
    });
});
//建立一個可存取到該file的url
function getObjectURL(file) {
    var url = null ;
    if (window.createObjectURL!=undefined)
    { // basic
        url = window.createObjectURL(file) ;
    }
    else if (window.URL!=undefined)
    {
        // mozilla(firefox)
        url = window.URL.createObjectURL(file) ;
    }
    else if (window.webkitURL!=undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file) ;
    }
    return url ;
}
function submitLog(img_url){
    var log = '';
    var _logpath = path.join(exeUrl, 'info_diary.log');
    fs.exists(_logpath, function(exists){
        if(exists){
            fs.readFile(_logpath, 'utf8', function (err, data) {
                log = data;
                sendFeedback(img_url,log)
            });
        }else {
            sendFeedback(img_url,log)
        }
    });
}
function sendFeedback(img_url,log){
    var phone = $("#tel").val();
    var desc = $("#question").val();
    if(desc==''){
        layer.msg("问题不能为空！");
        return;
    }
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var paramsObj = {"phone":phone, "desc":desc,"image_url":img_url,'log':log};
    //console.log(paramsObj);
    var sign = getSign(paramsObj,dateTime,salt);
    var token = localStorage.speedToken;
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':token
    };
    var headers = $.extend(headobj,header);
    $('.loading').show();
    $.ajax({
        type: "POST",
        url: url + '/common/feedback',
        data: paramsObj,
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            //console.log(data);
            //console.log(JSON.parse(Mydecrypt(data)));
            data = JSON.parse(Mydecrypt(data));
            $('.loading').hide();
            if(data.code == 200){
                layer.msg('问题提交成功！');
                $("#fileUp").val("");
                $("#myImg").attr("src", 'images/jd-shang-c.png');
                $("#tel").val('');
                $("#question").val('');
            }else if(data.code == 4003){
                layer.msg(data.msg);
                logOut();
            }else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            $('.loading').hide();
            layer.msg('出错了！');
        }
    });
}