'use strict'

const Electron = require('electron')
const { remote, shell, clipboard } = Electron
const { Menu, MenuItem } = remote
const rUrl = require('url-regex')({ exact: true })

function createSeparator () {
  return new MenuItem({ type: 'separator' })
}

function appendSeparator (menu) {
  menu.append(createSeparator())
}

function isUrl (input) {
  return rUrl.test(input)
}

function getMediaType (tagName) {
  switch (tagName) {
    case 'IMG':
      return 'Image'

    case 'VIDEO':
      return 'Video'

    case 'Audio':
      return 'Audio'
  }

  return ''
}

function getHref (el) {
  if (typeof el.href === 'string') {
    return el.href
  }

  return el.parentElement ? getHref(el.parentElement) : ''
}

function bindMediaRelatedMenuItems (e, menu) {
  const src = e.target.src
  const href = getHref(e.target)
  const selectedText = window.getSelection().toString()
  const items = []

  if (isUrl(href) || isUrl(selectedText)) {
    items.push(new MenuItem({
      label: 'Open Link in Default Browser',
      click () {
        shell.openExternal(href || selectedText)
      }
    }))

    items.push(createSeparator())
  }

  if (href) {
    let label = 'Save Link As...'

    items.push(new MenuItem({
      label,
      click () {
        const wc = remote.getCurrentWebContents()
        wc.downloadURL(href)
      }
    }))

    if (!selectedText) {
      items.push(new MenuItem({
        label: 'Copy Link Address',
        click () {
          clipboard.writeText(href)
        }
      }))
    }

    items.push(createSeparator())
  }

  if (src) {
    const type = getMediaType(e.target.tagName)

    items.push(new MenuItem({
      label: `Open ${type} in Default Browser`,
      click () {
        shell.openExternal(href || selectedText)
      }
    }))

    items.push(new MenuItem({
      label: `Save ${type} As...`,
      click () {
        const wc = remote.getCurrentWebContents()
        wc.downloadURL(src)
      }
    }))

    items.push(new MenuItem({
      label: `Copy ${type} Address`,
      click () {
        clipboard.writeText(src)
      }
    }))
  }

  if (items.length) {
    for (const item of items) {
      menu.append(item)
    }

    appendSeparator(menu)
  }
}

function bindTextRelatedMenuItems (menu) {
  const selectedText = window.getSelection().toString()
  const isTextSelected = selectedText.length > 0

  if (isTextSelected) {
    menu.append(new MenuItem({
      label: 'Cut',
      click: function () {
        document.execCommand('cut')
      }
    }))

    menu.append(new MenuItem({
      label: 'Copy',
      click: function () {
        document.execCommand('copy')
      }
    }))
  }

  if (clipboard.readText()) {
    menu.append(new MenuItem({
      label: 'Paste',
      click: function () {
        // document.execCommand('paste')
        document.execCommand('insertText', false, clipboard.readText())
      }
    }))
  }
}

window.addEventListener('contextmenu', function (e) {
  e.preventDefault()

  const menu = new Menu()

  bindMediaRelatedMenuItems(e, menu)
  bindTextRelatedMenuItems(menu)

  appendSeparator(menu)

  menu.append(new remote.MenuItem({
    label: 'Inspect',
    click () {
      remote.getCurrentWindow().inspectElement(e.x, e.y)
    }
  }))

  setTimeout(() => menu.popup(remote.getCurrentWindow()))
}, false)
