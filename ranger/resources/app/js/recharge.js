/**
 * Created by Administrator on 2018/10/30.
 */
$(function(){
    $('#top_ul li').removeClass("active");
    $("#recharge_go").addClass('active');
    var token = localStorage.speedToken;

    const rewebview = document.getElementById('rechargeView');

    const options = {extraHeaders:"Authorization:"+token+"\nPlatform: Windows"};
    rewebview.addEventListener("dom-ready", function() {
        //rewebview.openDevTools();
        if(rewebview.isLoading()){
            return;
        }
        rewebview.loadURL(web+'/recharge.html',options);
        rewebview.addEventListener('ipc-message', function(event) { //ipc-message监听，被webview加载页面传来的信息
            showRecharge(event.channel);

        })
    });
});
function  showRecharge(message){
    var cat = message;
    //console.log(cat);
    var msgJson = JSON.parse(cat);
    var token = localStorage.speedToken;
    if(msgJson.funcName=='card-'){
        const paywebview = document.getElementById('rechargePay');
        const options = {extraHeaders:"Authorization:"+token+"\nPlatform: Windows"};
        paywebview.addEventListener("dom-ready", function() {
            //rewebview.openDevTools();
            if(paywebview.isLoading()){
                return;
            }
            paywebview.loadURL(web+'/order/cdkey.html',options);
        });
        layer.open({
            type: 1,
            title: false,
            shadeClose: true,
            shade: 0.4,
            area: ['400px', '250px'],
            skin: 'my_card_box',
            content:$("#pay_card_box"),
            end: function () {
                $("#rechargePay").attr('src','about:blank');
            }
        });
    }else {
        var proId = parseInt(msgJson.data);
        goToPay(proId,-1,1);
    }
    $(document).on("click","#payCancel",function(){
        layer.close(layer.index);
    });
    $(document).on("click","#payHas",function(){
        layer.close(layer.index);
        getUserInfo();
    });
}
