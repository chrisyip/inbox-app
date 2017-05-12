'use strict'

const path = require('path')
const Electron = require('electron')

const { Tray, BrowserWindow, ipcMain } = Electron

const unreadIcon = path.join(__dirname, '../icon.iconset/tray-unread@2x.png')
const readIcon = path.join(__dirname, '../icon.iconset/tray-read@2x.png')

module.exports = () => {
  const tray = new Tray(readIcon)

  tray.on('click', () => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.getParentWindow() == null) {
        win.show()
        win.webContents.send('slave', 'trayActive')
        break
      }
    }
  })

  ipcMain.on('unread', (e, count) => {
    tray.setImage(parseInt(count, 10) > 0 ? unreadIcon : readIcon)
  })

  return tray
}
