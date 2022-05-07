const electron = require('electron'),
    app = require('electron').app,
    BrowserWindow = require('electron').BrowserWindow,
    ipc = electron.ipcMain,
    dialog = electron.dialog,
    path = require('path');

let mainWindow, settingsWindow;

app.on('window-all-closed', () => {
    if (process.platform != 'darwin')
        app.quit();
});


app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {}
    });
    mainWindow.maximize()
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (settingsWindow != null) {
            settingsWindow.close();
            settingsWindow = null
        }
    });
});