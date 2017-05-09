'use strict'

const path = require('path')
const modules = ['spellcheck', 'unread', 'accounts']

modules.forEach(function (mod) {
  try {
    require(path.join(__dirname, mod))
  } catch (err) {
    console.log(err)
  }
})
