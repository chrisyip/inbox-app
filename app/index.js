'use strict'

const fs = require('fs')
const electron = require('electron')
const app = electron.app

const badge = require('./badge')
const inbox = require('./inbox')
const menu = require('./menu')
const createTray = require('./tray')

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  const win = inbox.open('https://inbox.google.com')

  win.on('close', function () {
    fs.writeFileSync(inbox.getBoundsFile(), JSON.stringify({
      bounds: win.getBounds()
    }))
  })

  menu()
  badge()
  createTray()
})
