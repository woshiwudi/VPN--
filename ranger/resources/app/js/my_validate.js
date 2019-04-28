/**
 * Created by Administrator on 2018/10/30.
 */
$().ready(function() {
// 在键盘按下并释放及提交后验证提交表单
    $("#form_validation").validate({
        rules: {
            phone: {
                required: true,
                isphoneNum:true
            },
            code:{
                required: true,
                number:true,
                minlength: 4,
                maxlength:4
            },
            oldPsd: {
                required: true,
                minlength: 6
            },
            password: {
                required: true,
                minlength: 6
            },
            rePsd:{
                required: true,
                minlength: 6,
                equalTo: "#psd"
            },
            question:{
                required: true
            },
            tel:{
                required: false,
                isphoneNum:true
            }
        },
        messages: {
            phone: {
                required: "请输入手机号！",
                isphoneNum:"请填写正确的手机号码!"
            },
            code:{
                required: "请输入验证码！",
                number:"请输入数字",
                minlength: "验证码必须是4个数字！",
                maxlength: "验证码必须是4个数字！"
            },
            oldPsd: {
                required: "请输入原密码！",
                minlength: "密码长度不能小于6个字符！"
            },
            password: {
                required: "请输入密码！",
                minlength: "密码长度不能小于6个字符！"
            },
            rePsd:{
                required: "请输入确认密码！",
                minlength: "密码长度不能小于6个字符！",
                equalTo: "两次密码输入不一致"
            },
            question:{
                required: '输入问题不能为空！'
            },
            tel:{
                required: '请输入手机号！',
                isphoneNum:"请填写正确的手机号码!"
            }
        }
    });
});

//自定义手机号验证
jQuery.validator.addMethod("isphoneNum", function(value, element) {
    var length = value.length;
    var mobile = /^((13[0-9])|(14[5-9])|(15[0-3,5-9])|(17[0-1,3,5-8])|(18[0-9])|165|166|198|167|199|(147))\d{8}$/;
    return this.optional(element) || (length == 11 && mobile.test(value));
}, "请填写正确的手机号码!");