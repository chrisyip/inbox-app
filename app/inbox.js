'use strict'

const fs = require('fs')
const path = require('path')
const electron = require('electron')

const BrowserWindow = electron.BrowserWindow

const inject = require('./inject')
const windows = require('./windows')

function getUserId (url) {
  // The `authuser` parameter is present when switching profiles
  let m = url.match(/authuser=(\d)/)

  // ... otherwise the URLs look like this: `/u/<id>`
  if (!m) m = url.match(/\/u\/(\d)/)

  // ... or just `/` for the default user
  return m ? parseFloat(m[1]) : 0
}

// Returns the window for the given user id
function getUserWindow (id) {
  const all = BrowserWindow.getAllWindows()
  for (let i = 0; i < all.length; i++) {
    const win = all[i]
    const url = win.webContents.getURL()
    if (getUserId(url) === id) return win
  }
}

function getBrowserWindowBounds () {
  let data
  try {
    data = JSON.parse(fs.readFileSync(exports.getBoundsFile(), 'utf8'))
  } catch (e) {
  }
  return (data && data.bounds) ? data.bounds : {
    width: 1024,
    height: 768
  }
}

// Return the main window bounds json file
exports.getBoundsFile = function () {
  return path.join(electron.app.getPath('userData'), 'init.json')
}

exports.open = function (url, name) {
  // look for an existing window
  const id = getUserId(url)
  let win = getUserWindow(id)
  if (win) {
    win.show()
    return win
  }
  const windowBounds = getBrowserWindowBounds()
  win = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    show: name !== '_minimized',
    titleBarStyle: 'hidden',
    icon: __dirname.split('/').slice(0, -1).join('/') + '/icon.iconset/icon_256x256.png'
  })

  if (name === '_minimized') win.minimize()

  inject(win)
  windows(win)

  win.loadURL(url)
  return win
}
