const exec = require('child_process').execFile;
var spawn = require('child_process').spawnSync;
const cmdExe = require('child_process').exec;
const storage = require('electron-localStorage');
const os = require('os');
const request = require('request');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

var exeUrl = path.join(__dirname,'vpncore/');
var channelData = storage.getItem('channelData');
var projectName = 'ranger';
var lang = 'zh/zh-CN';
var device;
var plat = getBrand();
var channeltext = getChannel(channelData);
var usMsg = {
    "brand":getBrand(),
    "channel":channeltext,
    "country":"CN",
    "versionCode":'2.0.1',
    "systemName":'Windows',
    "systemVersion":getOS()
};
//console.log(usMsg);
var options = {
    cwd: exeUrl
};

var getDomain = spawn("vpncore.exe",['get_domain_url',projectName],options);
//console.log(getDomain.stdout.toString());
var domain = getDomain.stdout.toString().replace("\r\n","");
var getApi = spawn("vpncore.exe",['get_api_url',projectName],options);
//console.log(getApi.stdout.toString());
var api = getApi.stdout.toString().replace("\r\n","");
var urlApi = api.split("api.")[1];
var web = api.replace("api","web");
var getSalt = spawn("vpncore.exe",['get_salt'],options);
var salt = getSalt.stdout.toString().replace("\r\n","")+'yx';

var getUrl = spawn("vpncore.exe",['get_domain',domain],options);
//console.log(getUrl.stdout.toString());
if(getUrl.stdout.toString()!=''&&getUrl.stdout.toString()!='\r\n'&&(getUrl.stdout.toString().indexOf("api") != -1)){
    var urlResult = getUrl.stdout.toString().split('\r\n');
    var apiUrl = urlResult[0];
    var webUrl = urlResult[1];
    if((api!=apiUrl)&&(apiUrl.indexOf("api") != -1)){
        api = apiUrl;
    }
    if((web!=webUrl)&&(apiUrl.indexOf("web") != -1)){
        web = webUrl;
        urlApi = webUrl.split("web.")[1];
    }
}
var url = api+"/api/app";//api
if(localStorage.deviceId==undefined||localStorage.deviceId==''){
    var child = spawn("vpncore.exe",['reg-query',projectName],options);
    //console.log(child.stdout.toString());
    var result = child.stdout.toString();
    if(result == "True\r\n"){
        var child1 = spawn("vpncore.exe",['reg-get',projectName],options);
        var data1 =child1.stdout.toString();
        device = data1.replace(/[\r\n]/g,"");
        localStorage.deviceId = device;
        //console.log(device);
    }else {
        var ustr = uuid();
        var child2 = spawn("vpncore.exe",['reg-set',projectName,ustr],options);
        if(child2.stdout.toString() == "True\r\n"){
            localStorage.deviceId = ustr;
            device = ustr;
            //console.log(device);
        }
    }
}else {
    device = localStorage.deviceId;
}
var header = {
    'company': "",
    'language': lang,
    'deviceId': device,
    'Platform': plat,
    'Ua':JSON.stringify(usMsg),
    'channel': channeltext
};
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    var str = s.join("");
    return str;
}
//获得channel值
function getChannel(str){
    var m = str.replace(/\[.*?\]/g,'');
    var mm = m.replace(/\(.*?\)/g,'');
    var mmm = mm.replace(/\{.*?\}/g,'');
    //var mmmmm = mmm.replace(/\（.*?\）/g,'');
    //console.log(mmm);
    var arr = mmm.split('-');
    var j = arr.length;
    if(j<5){
        return 'pc_official';
    }else if(j==5){
        return arr[j-1].split('.')[0];
    }
    else {
        return [arr[j-2],arr[j-1].split('.')[0]].join('-');
    }
}
//获得系统具体版本
function getOS() {
    var sUserAgent = navigator.userAgent;
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "Mac";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux) return "Linux";
    if (isWin) {
        var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
        if (isWin2K) return "Windows2000";
        var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
        if (isWinXP) return "WindowsXP";
        var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
        if (isWin2003) return "Windows2003";
        var isWinVista= sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
        if (isWinVista) return "WindowsVista";
        var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
        if (isWin7) return "Windows7";
        var isWin8 = sUserAgent.indexOf("Windows 8") > -1;
        if (isWin8) return "Windows8";
        var isWin10 = sUserAgent.indexOf("Windows NT 10") > -1 || sUserAgent.indexOf("Windows 10") > -1;
        if (isWin10) return "Windows10";
    }
    return "other";
}
//获得系统版本类型
function getBrand(){
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    if(isWin) return "Windows";
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
    if (isMac) return "Mac";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux) return "Linux";
}