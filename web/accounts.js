'use strict'

const qsa = require('./qsa')

if (window.location.pathname === '/u/0/') {
  qsa('a[class=gb_tb][href*=authuser]').forEach(function (a) {
    window.open(a.href, '_minimized')
  })
}
