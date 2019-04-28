/**
 * Created by Administrator on 2018/10/30.
 */
$(function(){
    $(document).unbind('keyup').bind("keyup",function(e){
        e = window.event || e;
        if(e.keyCode == 13){
            $('#changePsd').trigger("click");
        }
    });
    $("#changePsd").click(function(){
       changePsd();
    }) ;
});
function changePsd(){
    if(!$("#form_validation").valid()){
        return;
    }
    var oldPsd = $("#oldPsd").val();
    var newPsd = $("#psd").val();
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var paramsObj = {"old_password":oldPsd, "new_password":newPsd};
    var token = localStorage.speedToken;
    var sign = getSign(paramsObj,dateTime,salt);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':token
    };
    var headers = $.extend(headobj,header);
    $('.loading').show();
    $.ajax({
        type: "PATCH",
        url: url + '/user/update_password',
        data: paramsObj,
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            //console.log(data);
            $("#oldPsd").val('');
            $("#psd").val('');
            $("#rePsd").val('');
            console.log(JSON.parse(Mydecrypt(data)));
            data = JSON.parse(Mydecrypt(data));
            $('.loading').hide();
            if(data.code == 200){
                layer.msg('密码修改成功！请重新登录！');
                storage.setItem('rangerUserid',data.data.uid);
                localStorage.speedPhone = data.data.phone;
                localStorage.speedToken = data.data.token;
                localStorage.speedExpire = data.data.expire_time;
                localStorage.speedSurplus = data.data.surplus_time;
                localStorage.speedVipTime = data.data.vip_expire_time;
                localStorage.speedWallet = data.data.wallet_count;
            }else if(data.code == 4003){
                layer.msg(data.msg);
                logOut();
            }else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            $('.loading').hide();
            $("#oldPsd").val('');
            $("#psd").val('');
            $("#rePsd").val('');
            layer.msg('出错了！');
        }
    });
}