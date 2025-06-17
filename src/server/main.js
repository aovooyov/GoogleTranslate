/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');

const { is } = require('electron-util');

const path = require('path');
const Store = require('electron-store');
const TrayGenerator = require('./TrayGenerator');

let mainWindow = null;
let trayObject = null;

const gotTheLock = app.requestSingleInstanceLock();

const store = new Store();

const initStore = () => {
  if (store.get('launchAtStart') === undefined) {
    store.set('launchAtStart', true);
  }

  if (store.get('rememberLanguages') === undefined) {
    store.set('rememberLanguages', true);
  }

  if (store.get('clearOnBlur') === undefined) {
    store.set('clearOnBlur', true);
  }

  if (store.get('useShortcut') === undefined) {
    store.set('useShortcut', true);
  }
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    transparent: true,
    width: 437,
    height: 328,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false, // Fixed size window
    vibrancy: 'hud', // Добавляем эффект мутного стекла
    visualEffectState: 'active',
    // x: 100, // Фиксированная позиция X (раскомментировать при необходимости)
    // y: 100, // Фиксированная позиция Y (раскомментировать при необходимости)
    webPreferences: {
      devTools: is.development,
      webviewTag: true,
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  if (is.development) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.loadURL(`file://${path.join(__dirname, '../../src/client/index.html')}`);
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../../src/client/index.html')}`);
  }

  // Устанавливаем User-Agent для обхода блокировки
  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  mainWindow.on('focus', () => {
    globalShortcut.register('Command+R', () => null);
  });

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
      globalShortcut.unregister('Command+R');
    }
    if (store.get('clearOnBlur')) {
      mainWindow.webContents.send('CLEAR_TEXT_AREA');
    }
  });
};

const createTray = () => {
  trayObject = new TrayGenerator(mainWindow, store);
  trayObject.createTray();
};

const savePreferences = () => {
  ipcMain.on('HASH', (event, arg) => {
    store.set('preferences', arg);
  });
};

const applyPreferences = () => {
  if (store.get('preferences') !== undefined && store.get('rememberLanguages')) {
    mainWindow.webContents.send('SAVED_HASH', store.get('preferences'));
  }
};

if (!gotTheLock) {
  app.quit();
} else {
  app.on('ready', () => {
    initStore();
    createMainWindow();
    createTray();
    savePreferences();

    mainWindow.webContents.on('dom-ready', applyPreferences);

    mainWindow.webContents.on('did-fail-load', () => console.log('fail'));
  });

  app.on('second-instance', () => {
    if (mainWindow) {
      trayObject.showWindow();
    }
  });

  if (!is.development) {
    app.setLoginItemSettings({
      openAtLogin: store.get('launchAtStart'),
    });
  }

  app.dock.hide();
}
