/**
 * Created by xx on 2018/12/24.
 */
var page = 0;
$(function(){
    var wallet_count = (localStorage.speedWallet)/100;
   $(".remain_num").text(wallet_count);
    var token = localStorage.speedToken;
    var options = {extraHeaders:"Authorization:"+token+"\nPlatform: Windows"};
    var walletwebview = document.getElementById('wallet_pay_box');
    $("#rcg_remain").click(function(){
        page = 0;
        walletwebview.addEventListener("dom-ready", function() {
            //rewebview.openDevTools();
            if(walletwebview.isLoading()||page!=0){
                return;
            }
            walletwebview.loadURL(web+'/order/wallet_recharge.html',options);
        });
        walletwebview.removeEventListener("dom-ready", function() {

        });
        layer.open({
            type: 1,
            title: false,
            shadeClose: true,
            shade: 0.4,
            area: ['460px', '510px'],
            skin: 'my_wallet_box',
            closeBtn: 1, //不显示关闭按钮
            content:$("#wallet_rcg_box"),
            end: function () {
                $("#wallet_pay_box").attr('src','about:blank');
            }
        });
    });
    $(document).on("click","#payCancel",function(){
        layer.close(layer.index);
    });
    $(document).on("click","#payHas",function(){
        layer.close(layer.index);
        getUserInfo();
    });
   /* var conpouwebview = document.getElementById('coupon_box');
    conpouwebview.addEventListener('ipc-message', function(event) { //ipc-message监听，被webview加载页面传来的信息
        console.log(event.channel);
    });*/
    /*$("#rcg_use").click(function(){
        conpouwebview.addEventListener("dom-ready", function() {
            //rewebview.openDevTools();
            if(conpouwebview.isLoading()){
                return;
            }
            conpouwebview.loadURL(web+'/user/coupon.html',options);
        });
        layer.open({
            type: 1,
            title: false,
            shadeClose: true,
            shade: 0.4,
            area: ['400px', '480px'],
            skin: 'my_card_box',
            content:$("#wallet_coupon_box"),
            end: function () {
                $("#coupon_box").attr('src','about:blank');
            }
        });
    });*/
});
function toPayWallet(typeData){
    //console.log(cat);
    var token = localStorage.speedToken;
    var msgJson = JSON.parse(typeData);
    var proId = parseInt(msgJson.data);
    if(msgJson.funcName=='wallet'){
        goToPay(proId,-1,0);
    }else if(msgJson.funcName=='walletc') {
        const walletwebview = document.getElementById('wallet_pay_box');
        const options = {extraHeaders: "Authorization:" + token + "\nPlatform: Windows"};
        walletwebview.loadURL(web + '/order/wallet_coupon_pay.html?id='+proId, options);
        page=1;
    }else if(msgJson.funcName=='walletd'){
        var num = msgJson.data;
        proId = parseInt(num.split(',')[0]);
        var coupon = parseInt(num.split(',')[1]);
        goToPay(proId,coupon,0);
    }
}