/**
 * Created by Administrator on 2018/10/30.
 */
$(function(){
    // 刷新按钮
    $("#toReload").click(function(){
        var dateTime = Math.round(new Date().getTime()/1000).toString();
        var sign = getSign('',dateTime,salt);
        var token = localStorage.speedToken;
        var headobj = {
            'ts':dateTime,
            'sign':sign,
            'Authorization':token
        };
        var headers = $.extend(headobj,header);
        $('.loading').show();
        $.ajax({
            type:"GET",
            url: url + '/user/user_info',
            data: '',
            headers:headers,
            contentType:"application/x-www-form-urlencoded",
            timeout: 10000,
            success: function (data) {
                //console.log(data);
                //console.log(JSON.parse(Mydecrypt(data)));
                data = JSON.parse(Mydecrypt(data));
                $('.loading').hide();
                if(data.code == 200){
                    storage.setItem('rangerUserid',data.data.uid);
                    localStorage.speedPhone = data.data.phone;
                    localStorage.speedExpire = data.data.expire_time;
                    localStorage.speedSurplus = data.data.surplus_time;
                    localStorage.speedWallet = data.data.wallet_count;
                    layer.msg('刷新成功！');
                    var phoneNum = localStorage.speedPhone;
                    var getTimeNor = localStorage.speedExpire;
                    $("#myAccount").text(phoneNum);
                    $("#theExpire").text(getDate(getTimeNor));
                    //window.location.reload();
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
    });
    //退出登录
    $("#logOut").click(function(){
        layer.confirm('确定要退出?', {icon: 3, title:'提示'}, function(index){
            layer.close(index);
            logOut();
        });
    });
    var phoneNum = localStorage.speedPhone;
    var getTimeNor = localStorage.speedExpire;
    $("#myAccount").text(phoneNum);
    $("#theExpire").text(getDate(getTimeNor));
});