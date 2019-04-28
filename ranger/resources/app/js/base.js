/**
 * Created by Administrator on 2018/10/24.
 */
$(document).ready(function(){
    //点击左边菜单栏切换
    $('#tab_ul a').click(function(e) {
        e.preventDefault();
        $('#tab_ul li').removeClass("active");
        $('#top_ul li').removeClass("active");
        $(this).parent().addClass("active");
        if($(this).attr('data-title')=="tab_link"){
            $(".top_ul").children("li").addClass("white_color");
            $(".hide_close_box").addClass("index_btn_box");
        }else {
            $(".top_ul").children("li").removeClass("white_color");
            $(".hide_close_box").removeClass("index_btn_box");
        }
    });
    //点击顶部导航栏切换
    $("#top_ul a").click(function(e){
        e.preventDefault();
        $(".hide_close_box").removeClass("index_btn_box");
        $('#top_ul li').removeClass("active");
        $('#tab_ul li').removeClass("active");
        $(this).parent().addClass("active");
        $(".top_ul").children("li").removeClass("white_color");

    });
});
var ipcRenderer=require('electron').ipcRenderer;
//关闭窗口
$(document).on("click",".hide_close_box .close_btn",function(){
    ipcRenderer.send('window-close');
});
//最小化
$(document).on("click",".hide_close_box .hide_btn",function () {
    ipcRenderer.send('window-min');
});

function getSign(params,ts,kAppSecret) {
    if (typeof params == "string") {
        return paramsStrSort(params,ts,kAppSecret);
    } else if (typeof params == "object") {
        var arr = [];
        for (var i in params) {
            arr.push((i + "=" + params[i]));
        }
        return paramsStrSort(arr.join(("&")), ts,kAppSecret);
    }
}
function paramsStrSort(paramsStr,ts,kAppSecret) {
    var url;
    if(ts=='pay'){
        url = paramsStr;
    }else {
        url = paramsStr + "&ts=" + ts;
    }
    var urlStr = url.split("&").sort().join("");
    var newUrl = urlStr + kAppSecret;
    //console.log(newUrl);
    return $.md5(newUrl);
}

function Mydecrypt(content) {
    var getContent = spawn("vpncore.exe",['get-aeskey'],options);
    //console.log(getContent.stdout.toString());
    var aesKey = getContent.stdout.toString().replace("\r\n","")+'yx';
    var key = CryptoJS.enc.Utf8.parse(aesKey);
    var bytes = CryptoJS.AES.decrypt(content.toString(), key, {
        iv: key,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var decryptResult = bytes.toString(CryptoJS.enc.Utf8);
    //console.log(decryptResult.toString());
    return decryptResult.toString();
}
//格式化时间
function getDate(str){
    var oDate = new Date(str*1000),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth()+1,
        oDay = oDate.getDate(),
        oTime = oYear+'-'+getzf(oMonth) +'-'+ getzf(oDay);//最后拼接时间
    return oTime;
};
//补0操作
function getzf(num){
    if(parseInt(num) < 10){
        num = '0'+num;
    }
    return num;
}
function logOut(){
    if(localStorage.link==1){
        ipcRenderer.send('vpn-stop', 'stop');
    }
    var channel = storage.getItem('channelData');
    storage.clear();
    localStorage.clear();
    storage.setItem('channelData',channel);
    goToLogin();
}
function getupdate(){
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var type = {type:'2'};
    var sign = getSign(type,dateTime,salt);
    //console.log(sign);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':''
    };
    var headers = $.extend(headobj,header);
    $.ajax({
        type: "GET",
        url: url + '/common/version',
        data: type,
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            //console.log(data);
            //console.log(JSON.parse(Mydecrypt(data)));
            data = JSON.parse(Mydecrypt(data));
            if(data.code == 200){
                var oldversion = usMsg.versionCode;
                //console.log(oldversion);
                var newvercode = ""+data.data.vercode;
                /*console.log(parseInt(oldversion.split('.').join('')));
                 console.log(parseInt(newvercode));*/
                if(parseInt(oldversion.split('.').join(''))<parseInt(newvercode)){
                    var newversion = newvercode.split('').join('.');
                    var fileUrl = data.data.app_url;
                    var datalog = data.data.log;
                    var state = data.data.state;
                    var filestr = storage.getItem('channelData');
                    var m = filestr.replace(/\[.*?\]/g,'');
                    var mm = m.replace(/\(.*?\)/g,'');
                    var filename = mm.replace(/\{.*?\}/g,'');
                    if(filename==''||filename==undefined){
                        filestr = fileUrl.split("/");
                        filename = filestr[filestr.length-1];
                    }
                    if(fileUrl!=""){
                        if(state=='0'){
                            layer.confirm('检测到新版本,立即更新？', {icon: 3, title:'提示'}, function(index){
                                layer.close(index);
                                downloadFile(fileUrl,filename,oldversion,newversion,datalog,state);
                            });
                        }else {
                            downloadFile(fileUrl,filename,oldversion,newversion,datalog,state);
                        }
                    }
                }
            }
            else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            //layer.msg('出错了！');
        }
    });
}

function downloadFile(file_url ,filename,oldversion,newversion,datalog,state){
    var oldv = oldversion;
    var newv = newversion;
    const homeDir = os.homedir();
    var targetPath = homeDir + '\\downloads\\' + filename;
    // Save variable to know progress
    var html ='<div class="download_box">'
        +'<div class="download_msg">已装：<span class="old_version">v'+oldv+'</span>升级：<span class="new_version">v'+newv+'</span></div>'
        +'<div class="download_text">'+datalog+'</div>'
        +'<progress max="100" value="0" id="pg"></progress>';
    if(state==0){
        html +='<div class="download_cancel_box"><button class="download_cancel">取消</button></div></div>';
    }else {
        html +='</div>';
    }
    //自定页
    layer.open({
        type: 1,
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 0, //不显示关闭按钮
        anim: 2,
        title:'安装新版本',
        area: ['300px', '210px'],
        shadeClose: false, //开启遮罩关闭
        content: html
    });
    var downloadIndex = layer.index;
    var received_bytes = 0;
    var total_bytes = 0;
    var hasclose = false;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length' ]);
    });
    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;
        showProgress(received_bytes, total_bytes);
    });

    req.on('end', function() {
        //console.log("下载成功！");
        if(!hasclose){
            layer.msg('新版下载成功！等待安装！');
            layer.close(downloadIndex);
            ipcRenderer.send('need-quit',filename);
        }
    });
    $(document).on('click','.download_cancel',function(){
        layer.msg('已取消下载！');
        layer.close(downloadIndex);
        req.abort();
        hasclose = true;
    });
}
//显示进度条
function showProgress(received,total){
    var percentage = (received * 100) / total;
    //console.log(percentage);
    var pg=document.getElementById('pg');
    pg.value = parseFloat(percentage);
    //console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
}

//已连接时的样式
function linkCss(){
    $(".link_btn").removeClass("no_link_btn");
    //$(".account_box").addClass("active");
    $(".link_bg").hide();
    //添加连接按钮动画
    $(".load_circle").addClass("load_animate");
}
//没连接时的样式
function noLinkCss(){
    $(".link_btn").addClass("no_link_btn");
    //$(".account_box").removeClass("active");
    $(".link_bg").show();
    //移除连接按钮动画
    $(".load_circle").removeClass("load_animate");
}
//开启vpn的操作
function startVpn(str){
    ipcRenderer.send('vpn-start', str);
}
//关闭vpn的操作
function stopVpn(){
    var getRun = spawn("vpncore.exe",['is_running'],{cwd: exeUrl});
    //console.log(getRun.stdout.toString());
    if(getRun.stdout.toString() == "False\r\n"){
        var getStart = spawn("vpncore.exe",['start'],{cwd: exeUrl});
        //console.log(getStart.stdout.toString());
    }
    ipcRenderer.send('vpn-stop', 'stop');
}
//获取ping时间值
function PingGetTime(){
    var lineList = JSON.parse(localStorage.getItem("lineListData"));
    //console.log(lineList);
    for (var i=0;i<lineList.length;i++){
        var cmd = 'ping '+lineList[i].ip+' -n 1';
        const timeObj = {time:''};
        const index = parseInt(lineList.length-i-1);
        const j = i;
        const lineid = lineList[i].id;
        cmdExe(cmd, function(error, stdout, stderr) {
            if (error) throw error;
            //console.log(stdout);
            var arr = stdout.split('=');
            var lastStr = arr[arr.length - 1];
            //console.log(lastStr);
            timeObj.time = lastStr;
            $.extend(lineList[j],timeObj);
            $($("#line_list").children()[index]).children(".time").text(lastStr);
            localStorage.setItem("lineListData",JSON.stringify(lineList));
            var id = localStorage.lineId;
            if(lineid == id){
                localStorage.delay = lastStr;
                $('.delay_time').text(lastStr);
            }
        });
    }
}
//获取线路数据
function getLineList(){
    var token = localStorage.speedToken;
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var sign = getSign('',dateTime,salt);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':token
    };
    var headers = $.extend(headobj,header);
    //console.log(headers);
    $('.loading').show();
    $.ajax({
        type: "GET",
        url: url + '/route_list',
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
                var id= localStorage.lineId;
                //加载线路列表
                localStorage.setItem("lineListData",JSON.stringify(data.data.route_list));
                var html = template("line_list_template",{"data":data.data.route_list,"id":id});
                $("#line_list").html(html);
                //获取ping时间值
                PingGetTime();
                var dateTime = new Date();
                localStorage.getLinetime = dateTime.getTime();
            }else if(data.code == 4003){
                layer.msg(data.msg);
                logOut();
            } else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            $('.loading').hide();
            layer.msg('出错了！');
        }
    });
}

function goToPay(proId,coupon,payType){
    var token = localStorage.speedToken;
    var paramsObj;
    if(coupon==-1){
        paramsObj = {"id":proId};
    }else {
        paramsObj = {"id":proId,"ticket_id":coupon};
    }
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var sign = getSign(paramsObj,dateTime,salt);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':token
    };
    var headers = $.extend(headobj,header);
    $('.loading').show();
    $.ajax({
        type: "POST",
        url: url + '/order/buy',
        data: paramsObj,
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            $('.loading').hide();
            //console.log(data);
            //console.log(JSON.parse(Mydecrypt(data)));
            data = JSON.parse(Mydecrypt(data));
            if(data.code == 200){
                var order_id = data.data.order_id;
                var price = data.data.real_money;
                var uid = storage.getItem('rangerUserid');
                var html = '<div id="qrcode_box" class="pay_box">'
                    +'<h2>￥'+price/100+'</h2>'+'<div id="qrcode" style="text-align: center;"></div>'
                    +'<p>1.不支持退款（请先体验，满意后再购买）</p>'
                    +'<p>2.请使用浏览器扫码打开进行支付</p>'
                    +'<p>3.请确认支付成功后再点击“支付已完成”按钮。</p>'
                    +'<div class="pay_btn_box"><button id="payCancel">取消</button><button class="has_pay" id="payHas">支付已完成</button></div></div>';
                $('body').append(html);
                var url;
                var paySign;
                var paramsObj;
                var getSecret = spawn("vpncore.exe",['get_app_secret'],options);
                var secret = getSecret.stdout.toString().replace("\r\n","");
                if(payType == 1){
                    paramsObj = {"order_id":order_id, "payType":1,"price":price,"remark":0,"uid":uid};
                    paySign = getSign(paramsObj,"pay",secret);
                    url = web+'/pay/?extend=pc&notify_url=https%3A//api.'+urlApi+'/api/app/order/recharge_result&order_id='+order_id+'&payType=1&price='+price+'&remark=0&uid='+uid+'&sign='+paySign;
                }else {
                    paramsObj = {"order_id":order_id,"price":price,"remark":0,"uid":uid};
                    paySign = getSign(paramsObj,"pay",secret);
                    url = web+'/pay/?extend=pc&notify_url=https%3A//api.'+urlApi+'/api/app/order/recharge_result&order_id='+order_id+'&price='+price+'&remark=0&uid='+uid+'&sign='+paySign;
                }
                //console.log(url);
                $("#qrcode").qrcode(url);
                var index = layer.open({
                    type: 1,
                    title: false,
                    shadeClose: true,
                    shade: 0.4,
                    area: ['228px', '332px'],
                    skin: 'my_recharge_box',
                    content:$("#qrcode_box"),
                    end: function () {
                        $("#qrcode_box").remove();
                        layer.close(index);
                    }
                });
            }else if(data.code == 4003){
                layer.msg(data.msg);
                logOut();
            } else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            $('.loading').hide();
            layer.msg('出错了！');
        }
    });
}

function getUserInfo(){
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var sign = getSign('',dateTime,salt);
    var token = localStorage.speedToken;
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':token
    };
    var headers = $.extend(headobj,header);
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
            if(data.code == 200){
                storage.setItem('rangerUserid',data.data.uid);
                localStorage.speedPhone = data.data.phone;
                localStorage.speedExpire = data.data.expire_time;
                localStorage.speedSurplus = data.data.surplus_time;
                localStorage.speedWallet = data.data.wallet_count;
                var phoneNum = localStorage.speedPhone;
                var getTimeNor = localStorage.speedExpire;
                $("#myAccount").text(phoneNum);
                $("#theExpire").text(getDate(getTimeNor));
            }else {
                logOut();
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            layer.msg('出错了！');
        }
    });
}

var layerLoginIndex;
function goToLogin(){
    linkChange('link.html',true,1,2);
    $("#top_ul li").removeClass('active');
    $("#tab_ul li").removeClass('active');
    $("#tab_ul li:eq(0)").addClass('active');
    layer.closeAll();
    $.ajax({
        type:'GET',
        url:'login.html',
        async:false,
        success:function(data){
            //console.log(data);
            layerLoginIndex =layer.open({
                type: 1,
                title:false,
                skin: 'layer_login_box', //样式类名
                closeBtn: 0, //不显示关闭按钮
                anim: 2,
                shape:0.4,
                shadeClose: false, //开启遮罩关闭
                area: ['330px', '344px'],
                content: data
            });
        }
    });
}
function goToIndex(){
    layer.close(layerLoginIndex);
    getUserInfo();
    linkChange('link.html',true,1,2);
    $("#top_ul li").removeClass('active');
    $("#tab_ul li").removeClass('active');
    $("#tab_ul li:eq(0)").addClass('active');
    getStartPage();

    var phoneNum = localStorage.speedPhone;
    var getTimeNor = localStorage.speedExpire;
    $(".menuPhone").text(phoneNum);
    $(".menuDate").text(getDate(getTimeNor));
}

//获取活动页
function getStartPage(){
    var dateTime = Math.round(new Date().getTime()/1000).toString();
    var sign = getSign('',dateTime,salt);
    var headobj = {
        'ts':dateTime,
        'sign':sign,
        'Authorization':''
    };
    var headers = $.extend(headobj,header);
    //console.log(headers);
    $.ajax({
        type: "GET",
        url: url + '/common/config_info',
        data: '',
        headers:headers,
        contentType:"application/x-www-form-urlencoded",
        timeout: 10000,
        success: function (data) {
            //console.log(data);
            //console.log(JSON.parse(Mydecrypt(data)));
            data = JSON.parse(Mydecrypt(data));
            if(data.code == 200){
                if(data.data.activity_info.image_url!=""){
                    var html = '<div class="start_page"><img id="goActivity" src='+data.data.activity_info.image_url+' alt="活动广告图"></div>';
                    //自定页
                    layer.open({
                        type: 1,
                        title:false,
                        skin: 'my_start_box',
                        shape:0.4,
                        area: ['600px', '450px'],
                        shadeClose: true, //开启遮罩关闭
                        content: html
                    });
                }else if(data.data.activity_info.desc!=""){
                    var html1 = '<div class="notice_page"><h2 class="layer_title">'+data.data.activity_info.title+'</h2><div class="notice_text">'+data.data.activity_info.desc+'</div></div>';
                    //自定页
                    layer.open({
                        type: 1,
                        title:false,
                        skin: 'my_notice_box',
                        shape:0.4,
                        area: ['400px', '230px'],
                        closeBtn: 1, //不显示关闭按钮
                        shadeClose: true, //开启遮罩关闭
                        content: html1
                    });
                }
            }else if(data.code == 4003){
                layer.msg(data.msg);
                logOut();
            } else {
                layer.msg(data.msg);
            }
        },
        error: function (data) {
            layer.msg('出错了！');
        }
    });
}