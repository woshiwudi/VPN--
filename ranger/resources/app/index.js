const electron=require("electron");
const path = require('path');
const fs = require('fs');
const { Menu,Tray } = electron;
const app=electron.app;
const BrowserWindow=electron.BrowserWindow;
const ipc = electron.ipcMain;
const storage = require('electron-localStorage');
const spawn = require('child_process').spawn;
const os = require('os');
const dialog = require('electron').dialog;
var exeUrl = path.join(__dirname,'vpncore/');
let mainWindow;
let mianInstance;
let tray;

var _path = path.join(__dirname, '../../', 'channel.txt');
fs.readFile(_path, 'utf8', function (err, data) {
    if (err) storage.setItem('channelData','');
    storage.setItem('channelData',data);
});
// 检测实例
const moreInstance = app.makeSingleInstance((commandline, workingDirectory) => {
        if(mainWindow) { // 如果存在执行以下

            // 判断主实例窗口是否最小化 如果是的话 恢复到之前的状态
            if (mainWindow.isMaximized()) mainWindow.restore()
            mainWindow.focus() // 主实例窗口focus
            mainWindow.setSkipTaskbar(false)
            mainWindow.show()
        }
    })

if (moreInstance) {
    app.quit()
}

function createWindow(){
    mainWindow=new BrowserWindow({
        width:682,
        height:552,
        resizable: false,
        frame:false,
        show:false,
        icon: path.join(__dirname, '/icon.ico')
    });
    mainWindow.loadURL('file://'+__dirname+'/index.html');
    mainWindow.once('ready-to-show',() =>{
        mainWindow.show();
});
    var _vpnpath = path.join(exeUrl,'vpncore.exe');
    fs.exists(_vpnpath, function(exists){
        if(!exists){
            dialog.showMessageBox(
                {
                    type: 'info',
                    title: '信息',
                    message: "文件损坏！请重新安装！",
                    buttons: []
                })
        }
    });
    // google 调试器
    //mainWindow.webContents.openDevTools();
    mainWindow.on("closed",function(){
        mainWindow = null;
    });

    //监听关闭事件
    mainWindow.on('close', (event) => {
        mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
    event.preventDefault();
});
    mainWindow.on('show', () => {
        tray.setHighlightMode('always')
})
    mainWindow.on('hide', () => {
        tray.setHighlightMode('never')
})

    //创建系统通知区菜单
    tray = new Tray(path.join(__dirname, 'icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        {label: '退出', click: () => {
            mainWindow.webContents.send('quit-message', 'quit');
    mainWindow.destroy()}
},//一个真正的退出（这里直接强制退出）
])
    tray.setToolTip('游侠');
    tray.setContextMenu(contextMenu)
    tray.on('click', ()=>{ //模拟桌面程序点击通知区图标实现打开关闭应用的功能
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false):mainWindow.setSkipTaskbar(true);
})
}

app.on("ready",createWindow);
app.on("window-all-closed",function(){
    if(process.platform!="darwin"){
        app.quit();
    }
});

app.on("activate",function(){
    if(mainWindow===null){
        createWindow();
    }
});

//最小化和关闭消息响应
ipc.on('window-min',function(){
    mainWindow.minimize();
});

ipc.on('window-close',function(){
    mainWindow.close();
});
//开启vpn
ipc.on('vpn-start', function (event, arg) {
    var arr = arg.split("-");
    const child = spawn("vpncore.exe",arr,{cwd: exeUrl});
    child.stdout.on('data', function(data) {
        event.sender.send('has-start', 'start');
    });
    child.on('close', function(code) {
        event.sender.send('has-start', code);
    });
});
//关闭vpn
ipc.on('vpn-stop', function (event, arg) {
    var arr = ['stop'];
    spawn("vpncore.exe",arr,{cwd: exeUrl });
});
ipc.on('need-quit', function(event, arg) {
    const homeDir = os.homedir();
    const {spawn} = require('child_process');
    const subprocess = spawn(arg,{
        cwd: homeDir + '\\downloads\\',
        detached: true,
        stdio: 'ignore'
    });
    subprocess.unref();
    mainWindow.webContents.send('quit-message', 'quit');
    mainWindow.destroy();
});