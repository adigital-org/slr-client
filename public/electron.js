const { app, Menu, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const os = require('os');

let win;
Menu.setApplicationMenu(null);

const sysMem = Math.floor(os.totalmem()/1024/1024);
const maxMem = (sysMem*0.75 >= 2048) ? Math.floor(sysMem*0.75) : sysMem;
app.commandLine.appendSwitch ("disable-http-cache");
app.commandLine.appendSwitch(
  'js-flags',
  '--max-old-space-size=' + maxMem
);

function createWindow() {
  win = new BrowserWindow({ width: 1024, height: 768, webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: false,
      icon: path.join(__dirname, '/1024x1024.png'),
      preload: __dirname + '/preload.js'
    } });
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  win.on("closed", () => (win = null));
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});