'use strict'

const URL = require('url')
const electron = require('electron')
const shell = electron.shell

const inbox = require('./inbox')

const googleHosts = [
  'accounts.google.com',
  'mail.google.com',
  'google-mail.com'
]

module.exports = function (win) {
  const wc = win.webContents
  wc.on('new-window', function (ev, url, name) {
    const host = URL.parse(url).host
    if (host === 'inbox.google.com') {
      ev.preventDefault()
      inbox.open(url, name)
    } else if (!~googleHosts.indexOf(host)) {
      ev.preventDefault()
      shell.openExternal(url)
    }
  })
}
