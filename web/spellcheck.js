'use strict'

const webFrame = require('electron').webFrame
const Spellchecker = require('spellchecker').Spellchecker

const checker = new Spellchecker()
const langs = checker.getAvailableDictionaries().slice(0, 2)

webFrame.setSpellCheckProvider('en', false, {
  spellCheck: function (word) {
    return langs.some(function (lang) {
      // Using multiple instances does not work, we have to swap the dictionary:
      checker.setDictionary(lang)
      return !checker.isMisspelled(word)
    })
  }
})
