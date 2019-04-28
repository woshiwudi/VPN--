/**
 * Created by Administrator on 2018/10/24.
 */
$(function(){
    $(".login_content").removeClass("register_content");
    var channel = storage.getItem('channelData');
    storage.clear();
    localStorage.clear();
    storage.setItem('channelData',channel);
    $(document).unbind('keyup').bind("keyup",function(e){
        e = window.event || e;
        if(e.keyCode == 13){
            $('#btn_login').trigger("click");
        }
    });
    $("#btn_login").click(function(){
        login();
    });
});
function login(){
    var phone_box = $("#phone");
    var password_box = $("#psd");
    if(!$("#form_validation").valid()){
        return;
    }
    var phone = phone_box.val();
    var password = password_box.val();
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var paramsObj = {"phone":phone, "username":'',"password":password,"company_name":''};
    var sign = getSign(paramsObj,dateTime,salt);
    //console.log(sign);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':''
    };
    var headers = $.extend(headobj,header);
    // console.log(headers);
    $('.loading').show();
    //console.log(headers)


    
    $.ajax({
        type: "POST",
        url: url + '/user/login',
        data: paramsObj,
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            phone_box.val('');
            password_box.val('');
            //console.log(data);
            //console.log(JSON.parse(Mydecrypt(data)));
            data = JSON.parse(Mydecrypt(data));
            $('.loading').hide();
            if(data.code == 200){
	           
                $("#form_validation").validate().resetForm();
                storage.setItem('rangerUserid',data.data.uid);
                localStorage.speedPhone = data.data.phone;
                localStorage.speedToken = data.data.token;
                localStorage.speedExpire = data.data.expire_time;
                localStorage.speedSurplus = data.data.surplus_time;
                localStorage.speedVipTime = data.data.vip_expire_time;
                localStorage.speedWallet = data.data.wallet_count;
                layer.msg(url + '/user/login');
                 alert(url + '/user/logi')
                goToIndex();
            }
            else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            phone_box.val('');
            password_box.val('');
            $('.loading').hide();
            layer.msg('出错了！');
        }
    });
}


