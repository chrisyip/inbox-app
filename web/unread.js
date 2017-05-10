/* eslint-env browser */

'use strict'

const electron = require('electron')
const ipc = electron.ipcRenderer
const remote = electron.remote
const click = require('./click')

let seen

function extractData (ss) {
  const p = ss.closest('[data-item-id][role="listitem"]')

  if (p == null) {
    return
  }

  let avatar, subject

  const id = p.dataset.itemId

  // Skip clusters
  if (id == null || id.startsWith('#^')) {
    return
  }

  if (p.querySelector('.itemIconMarkedDone')) {
    return
  }

  subject = (p.querySelector('.lt') || p.querySelector('.qG span')).textContent

  const brand = ss.getAttribute('brand_name')
  if (brand) {
    avatar = ss.getAttribute('brand_avatar_url')
  } else {
    const img = p.querySelector('img')
    if (img) {
      avatar = img.src
    } else {
      const icon = p.querySelector('.pE')
      const bg = getComputedStyle(icon)['background-image']
      avatar = bg.replace(/url\((.+)\)/, '$1')
    }
  }

  return {
    id,
    subject,
    sender: ss.textContent,
    avatar,
    element: ss
  }
}

function getNew (messages) {
  return messages.filter(function (msg) {
    return !seen[msg.id]
  })
}

function getUnreadMessages () {
  const list = document.querySelector('[role="application"] > [role="list"]')

  if (list == null) {
    return []
  }

  return Array.prototype.map.call(list.querySelectorAll('.ss'), extractData)
          .filter(item => item != null)
}

window.createBadge = function (text) {
      // Create badge
  const canvas = document.createElement('canvas')
  canvas.height = 140
  canvas.width = 140
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI)
  ctx.fill()
  ctx.textAlign = 'center'
  ctx.fillStyle = 'white'

  if (text.length > 2) {
    ctx.font = '75px sans-serif'
    ctx.fillText('' + text, 70, 98)
  } else if (text.length > 1) {
    ctx.font = '100px sans-serif'
    ctx.fillText('' + text, 70, 105)
  } else {
    ctx.font = '125px sans-serif'
    ctx.fillText('' + text, 70, 112)
  }

  return canvas.toDataURL()
}

function checkState () {
  const messages = getUnreadMessages()
  const count = messages.length
  ipc.send('unread', '' + count)

  const firstTime = !seen
  if (firstTime) seen = {}

  getNew(messages).forEach(function (msg) {
    if (!firstTime) {
      // Don't show notifications upon startup
      new Notification(msg.sender, {
        tag: msg.id,
        body: msg.subject,
        icon: msg.avatar
      })
      .addEventListener('click', function (ev) {
        remote.getCurrentWindow().show()
        click(msg.element)
      })
    }
    seen[msg.id] = true
  })
}

function observeNewMessages () {
  if (window._newMessageObserver instanceof MutationObserver) {
    window._newMessageObserver.disconnect()
  }

  const list = document.querySelector('[role="application"] > [role="list"]')

  if (list) {
    let timer

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const node = mutation.addedNodes[0] || mutation.removedNodes[0]

          if (node && node.classList.contains('scroll-list-item')) {
            clearTimeout(timer)
            timer = setTimeout(checkState, 50)
          }
        }
      }
    })

    observer.observe(list, { subtree: true, childList: true })
    window._newMessageObserver = observer
  }
}

checkState()
observeNewMessages()
