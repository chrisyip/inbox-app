'use strict'

const fs = require('fs')
const path = require('path')
const URL = require('url')
const platform = require('platform')

const dir = path.resolve(__dirname, '..').replace(/\\/g, '/')

module.exports = function (win) {
  const wc = win.webContents
  wc.on('did-navigate', function (ev, url) {
    const host = URL.parse(url).host

    if (host === 'inbox.google.com') {
      insertCss(wc)
      this.once('did-finish-load', function () {
        wc.executeJavaScript('module.paths.push("' + dir + '/node_modules");')
        wc.executeJavaScript('module.paths.push("' + dir + '/web");')
        wc.executeJavaScript('require("inject");')
      })
    }

    this.once('did-finish-load', function () {
      wc.executeJavaScript(`require('${path.resolve(__dirname, '../web/context-menu.js')}')`)
    })
  })

  function insertCss (wc) {
    wc.insertCSS(fs.readFileSync(dir + '/web/css/custom.css', 'utf8'))
    try {
      const customCss = 'custom-' + platform.os.family.replace(/\s/, '').toLowerCase() + '.css'
      wc.insertCSS(fs.readFileSync(dir + '/web/css/' + customCss, 'utf8'))
    } catch (e) {
    }
  }
}
