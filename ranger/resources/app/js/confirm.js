/**
 * Created by Administrator on 2018/11/16.
 */
//var _confirm = window.confirm;
const {ipcRenderer} = require('electron');
//拦截confirm弹框，获取其值
window.confirm = function (message) {
    ipcRenderer.sendToHost(message) //向webview所在页面发送消息
};