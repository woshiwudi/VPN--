/**
 * Created by Administrator on 2018/10/30.
 */
$(function(){
    $(".login_content").addClass("register_content");
    var validCode=true;
    var t;
    $("#getCode").click(function(){
        var that = $(this);
        if(!validCode){
            return;
        }
        if(!$("#form_validation").validate().element($("#phone"))){
            return;
        }
        var phone = $("#phone").val();
        var dateTime = Math.round(new Date().getTime()/1000).toString();
        var paramsObj = {"phone": phone, "type": 0};
        var sign = getSign(paramsObj,dateTime,salt);
        //console.log(sign);
        var headobj = {
            'ts':dateTime,
            'sign':sign,
            'Authorization':''
        };
        var headers = $.extend(headobj,header);
        $.ajax({
            type: "POST",
            url: url + '/common/captcha',
            data: paramsObj,
            headers:headers,
            contentType:"application/x-www-form-urlencoded",
            timeout: 10000,
            success: function (data) {
                //console.log(data);
                //console.log( Mydecrypt(data));
                data = JSON.parse(Mydecrypt(data));
                if(data.code == 200){
                    //获取短信验证码
                    var time=60;
                    var code=that;
                    if (validCode) {
                        validCode=false;
                        t=setInterval(function () {
                            time--;
                            code.val(time+"秒");
                            if (time==0) {
                                clearInterval(t);
                                code.val("重新获取");
                                validCode=true;
                            }
                        },1000)
                    }
                    layer.msg('验证码已发送！');
                }
                else {
                    layer.msg(data.msg);
                }
            },
            error: function (data) {
                layer.msg(data);
            }
        });
    });
    $(document).unbind('keyup').bind("keyup",function(e){
        e = window.event || e;
        if(e.keyCode == 13){
            $('#btn_register').trigger("click");
        }
    });
    $("#btn_register").click(function(){
        register(t);
    });
});
function register(t){
    var phone_box = $("#phone");
    var code_box = $("#code");
    var password_box = $("#psd");
    var rePsd_box = $("#repsd");
    if(!$("#form_validation").valid()){
        return;
    }
    var phone = phone_box.val();
    var code = code_box.val();
    var password = password_box.val();
    var re_password = rePsd_box.val();
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var paramsObj = {"phone":phone, "captcha":code,"password":password};
    var sign = getSign(paramsObj,dateTime,salt);
    //console.log(sign);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':''
    };
    var headers = $.extend(headobj,header);
    $('.loading').show();
    $.ajax({
        type: "POST",
        url: url + '/user/register',
        data: paramsObj,
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            //console.log(data);
            //console.log(JSON.parse(Mydecrypt(data)));
            phone_box.val('');
            code_box.val('');
            password_box.val('');
            rePsd_box.val('');
            data = JSON.parse(Mydecrypt(data));
            $('.loading').hide();
            if(data.code == 200){
                layer.msg('注册成功！');
                $("#form_validation").validate().resetForm();
                clearInterval(t);
                $("#getCode").val('发送验证码');
            }
            else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            phone_box.val('');
            code_box.val('');
            password_box.val('');
            rePsd_box.val('');
            $('.loading').hide();
            layer.msg('出错了！');
        }
    });
}
