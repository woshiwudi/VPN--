/**
 * Created by Administrator on 2018/12/4.
 */
$(function(){
    var link = localStorage.link;
    if(link == 1){
        $('.no_link').addClass('has_link').text('已连接');
    }else {
        $('.no_link').removeClass('has_link').text('未连接');
    }
    exec("vpncore.exe",['check_connect'],{cwd: exeUrl},function(err,data){
        if(err) throw err;
        //console.log(err);
        //console.log(data);
        if(data == "1\r\n"){
            $('.no_net').addClass('has_net').text('已连接');
        }else {
            $('.no_net').removeClass('has_net').text('未连接');
        }
    });
   $("#network_repair").click(function(){
       $(".onloading").show();
       exec("vpncore.exe",['flush_dns'],{cwd: exeUrl},function(err,data){
           if(err) throw err;
           //console.log(err);
           //console.log(data);
           if(data == "0\r\n"){
               $(".onloading").hide();
               layer.msg('网络修复失败！请联系技术人员！')
           }else {
               exec("vpncore.exe",['restore_hosts'],{cwd: exeUrl},function(err,data){
                   if(err) throw err;
                   //console.log(err);
                   //console.log(data);
                   if(data == "0\r\n"){
                       $(".onloading").hide();
                       layer.msg('网络修复失败！请联系技术人员！')
                   }else {
                       exec("vpncore.exe",['restore_http_proxy'],{cwd: exeUrl},function(err,data){
                           if(err) throw err;
                           //console.log(err);
                           //console.log(data);
                           $(".onloading").hide();
                           if(data == "0\r\n"){
                               layer.msg('网络修复失败！请联系技术人员！')
                           }else {
                               layer.msg('网络修复成功！')
                           }
                       });
                   }
               });
           }
       });
   }) ;
    $("#more_repair").click(function(){
        $(".onloading").show();
        exec("vpncore.exe",['flush_dns'],{cwd: exeUrl},function(err,data){
            if(err) throw err;
            //console.log(err);
            //console.log(data);
            if(data == "0\r\n"){
                $(".onloading").hide();
                layer.msg('网络深度修复失败！请联系技术人员！')
            }else {
                exec("vpncore.exe",['restore_hosts'],{cwd: exeUrl},function(err,data){
                    if(err) throw err;
                    //console.log(err);
                    //console.log(data);
                    if(data == "0\r\n"){
                        $(".onloading").hide();
                        layer.msg('网络深度修复失败！请联系技术人员！')
                    }else {
                        exec("vpncore.exe",['restore_http_proxy'],{cwd: exeUrl},function(err,data){
                            if(err) throw err;
                            //console.log(err);
                            //console.log(data);
                            if(data == "0\r\n"){
                                $(".onloading").hide();
                                layer.msg('网络深度修复失败！请联系技术人员！')
                            }else {
                                exec("vpncore.exe",['restore_lsp'],{cwd: exeUrl},function(err,data){
                                    if(err) throw err;
                                    //console.log(err);
                                    //console.log(data);
                                    $(".onloading").hide();
                                    if(data == "0\r\n"){
                                        layer.msg('网络深度修复失败！请联系技术人员！')
                                    }else {
                                        layer.confirm('修复成功！您必须重新启动计算机才能完成修复！', {icon: 3, title:'提示'}, function(index){
                                            layer.close(index);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }) ;
    $("#card_repair").click(function(){
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
                    }else {
                        layer.msg('网卡安装失败！');
                    }
                });
            }else {
                layer.msg("您已安装网卡！")
            }
        });
    }) ;
});