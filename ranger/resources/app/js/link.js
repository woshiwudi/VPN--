/**
 * Created by Administrator on 2018/10/25.
 */
var linkState = 1;
$(function(){
    var showAd = false;
    if(!showAd){
        $(".my_link_box").addClass("no_show_ad")
    }
    //预设线路
    var token = localStorage.speedToken;
    var lineName='';
    var lineTime='';
    if(localStorage.lineName==undefined){
        if(localStorage.speedVipTime==0){
            localStorage.lineId = 7;
            localStorage.lineName = '备用线路';
            $('.line_name').text(localStorage.lineName);
            var cmd1 = 'ping 193.112.155.200 -n 1';
            cmdExe(cmd1, function(error, stdout, stderr) {
                if (error) throw error;
                //console.log(stdout);
                var arr = stdout.split('=');
                var lastStr = arr[arr.length - 1];
                localStorage.delay = lastStr;
                $('.delay_time').text(lastStr);
            });
        }else {
            localStorage.lineId = 5;
            localStorage.lineName = '豪华线路';
            $('.line_name').text(localStorage.lineName);
            var cmd2 = 'ping 134.175.226.127 -n 1';
            cmdExe(cmd2, function(error, stdout, stderr) {
                if (error) throw error;
                //console.log(stdout);
                var arr = stdout.split('=');
                var lastStr = arr[arr.length - 1];
                localStorage.delay = lastStr;
                $('.delay_time').text(lastStr);
            });
        }
    }else {
        lineName=localStorage.lineName;
        lineTime=localStorage.delay;
        $('.line_name').text(lineName);
        $('.delay_time').text(lineTime);
    }
    //广告图右按钮点击事件
    var index = 0;
    var liLen;
    var unit=546;
    var page=3;
    $(".rightBtn").click(function(){
        index++;
        liLen = $(".say_content ul.say_contentUl li").length;
        if(index >= page)
        {
            $(".say_content ul.say_contentUl").stop();
            index = 2;
        }else{
            $(".say_content ul.say_contentUl").animate({left:-index*unit},546);
        }
    });
    //广告图左按钮点击事件
    $(".leftBtn").click(function(){
        if(index == 0)
        {
            $(".content ul.say_contentUl").stop();
        }else{
            index--;
            if(index == 0)
            {
                $(".say_content ul.say_contentUl").animate({left:0},546);
            }else{
                $(".say_content ul.say_contentUl").animate({left:-index*unit},546);
            }
        }
    });
    var adtimer = null;
    //定时器的使用，广告图自动轮播
    adtimer = setInterval(function (){
        index++;
        if(index>=page){index=0};
        $(".say_content ul.say_contentUl").animate({left:-index*unit},546);
    },4000);
    //hover事件完成悬停和左右图标的动画效果
    $(".cus_say_content").hover(function(){
        $(".leftBtn,.rightBtn").animate({
            "opacity":1
        },200);
        clearInterval(adtimer);
    },function(){
        $(".leftBtn,.rightBtn").animate({
            "opacity":0
        },500);
        adtimer = setInterval(function (){
            index++;
            if(index>=page){index=0};
            $(".say_content ul.say_contentUl").animate({left:-index*unit},546);
        },4000);
    });
    //判断是否连接，link为1时表示已连接
    var link = localStorage.link;
    if(link==1){
        $(".link_btn").removeClass("no_link_btn");
        //$(".account_box").addClass("active");
        $(".link_bg").hide();
    }else {
        $(".link_btn").addClass("no_link_btn");
        //$(".account_box").removeClass("active");
        $(".link_bg").show();
        //移除连接按钮动画
        $(".load_circle").removeClass("load_animate");
    }

    $('#link_btn').click(function () {
        if(linkState==0){
            return;
        }
        linkState=0;
        link = localStorage.link;
        if(link==1){
            stopVpn();
        }else {
            var id;
            if(localStorage.lineId!=undefined){
                id = localStorage.lineId;
            }else {
                return;
            }
            linkCss();
            var dateTime = Math.round(new Date().getTime()/1000).toString();
            var paramsObj = {"id":id};
            var sign = getSign(paramsObj,dateTime,salt);
            var headobj = {
                'ts':dateTime,
                'sign':sign,
                'Authorization':token
            };
            var headers = $.extend(headobj,header);
            $.ajax({
                type: "GET",
                url: url + '/user/route_info',
                data: paramsObj,
                headers:headers,
                contentType:"query",
                timeout: 10000,
                success: function (data) {
                    //console.log(data);
                    //console.log(JSON.parse(Mydecrypt(data)));
                    data = JSON.parse(Mydecrypt(data));
                    if(data.code == 200){
                        var ip = data.data.ip;
                        var their_public_key = data.data.their_public_key;
                        var mask = data.data.mask;
                        var allow_ip = data.data.allow_ip;
                        var ts = data.data.ts;
                        var sign = data.data.sign;
                        var arr = ['start',ip,their_public_key,mask,allow_ip,ts,sign];
                        var str = arr.join("-");
                        //console.log(arr);
                        var getRun = spawn("vpncore.exe",['is_running'],{cwd: exeUrl});
                        //console.log(getRun.stdout.toString());
                        if(getRun.stdout.toString() == "False\r\n"){
                            var getStart = spawn("vpncore.exe",['start'],{cwd: exeUrl});
                            //console.log(getStart.stdout.toString());
                        }
                        exec("vpncore.exe",['get-adapter-index'],{cwd: exeUrl},function(err,data){
                            if(err) throw err;
                            //console.log(err);
                            //console.log(data);
                            //若data为-1，则表示用户未安装网卡
                            if(data==-1){
                                exec("vpncore.exe",['setup-tap'],{cwd: exeUrl},function(err,data){
                                    if(err) throw err;
                                    //console.log(err);
                                    //console.log(data);
                                    //data为true时表示安装成功
                                    if(data == "True\r\n"){
                                        layer.msg('网卡安装成功！');
                                        startVpn(str);
                                    }else {
                                        linkState = 1;
                                        noLinkCss();
                                        layer.msg('网卡安装失败！');
                                    }
                                });
                            }else {
                                startVpn(str);
                            }
                        });
                    }else if(data.code == 4003){
                        layer.msg(data.msg);
                        logOut();
                    } else {
                        linkState = 1;
                        noLinkCss();
                        layer.msg(data.msg);
                    }
                },
                error: function (data) {
                    linkState = 1;
                    noLinkCss();
                    layer.msg('出错了！');
                }
            });
        }
    });
    //点击专线切换
    var layerLineIndex;
    $(".line_name").click(function(){
        var nowDate = new Date();
        var oldDate = localStorage.getLinetime;
        var time = parseInt((nowDate.getTime()-oldDate)/1000/60);
        //console.log(time);
        layer.open({
            type: 1,
            title:false,
            skin: 'my_line_box',
            shape:0.4,
            area: ['364px', '343px'],
            content: $("#line_list_content")
        });
        layerLineIndex = layer.index;
        if(time>=10||localStorage.getLinetime==undefined){
            getLineList();
        }
        else {
            var id = localStorage.lineId;
            var lineList = JSON.parse(localStorage.getItem("lineListData"));
            var html = template("line_list_template",{"data":lineList,"id":id});
            $("#line_list").html(html);
            //获取ping时间值
            PingGetTime();
        }
    });
    //点击专线列表切换
    $("#line_list").on("click","li",function(){
       $($("#line_list li").removeClass("active"));
        $(this).addClass("active");
        localStorage.lineId = $(this).attr('data-id');
        var id = $(this).attr('data-id');
        var lineList = JSON.parse(localStorage.getItem("lineListData"));
        //console.log(lineList);
        for (var i=0;i<lineList.length;i++){
            if(lineList[i].id == id){
                localStorage.lineName = lineList[i].name;
                localStorage.delay = lineList[i].time;
                $('.line_name').text(lineList[i].name);
                $('.delay_time').text(lineList[i].time);
                if(localStorage.link==1){
                    stopVpn();
                }
            }
        }
        layer.close(layerLineIndex);
    });

    const shell = require('electron').shell;
    $("#adImg").on("click","li a",function(){
        var url = $(this).attr('data-url');
        shell.openExternal(url);
    });
});
