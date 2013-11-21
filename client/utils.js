/* globals alert: true, ace: true, JSZip: true, window: true, document: true */

var Tip = require('tip')

module.exports = {
  genId: genId,
  tipMe: tipMe,
  debounce: debounce,
  rebounce: rebounce,
  initHash: initHash,
  createZip: createZip,
  makeMirror: makeMirror
}

// called the first time, then sets a timeout. All calls within the
// "bounce" are ignored, but the arguments are updated, such that the
// last call before the bounce will be executed once the bounce is
// done.
function rebounce(fn, num) {
  num = num || 300
  var id, args
  return function () {
    var self = this
    args = arguments
    if (id) return
    fn.apply(this, arguments)
    id = setTimeout(function () {
      // if it's been called during the bounce, hit that up.
      if (args) fn.apply(self, args)
      id = null
    }, num)
  }
}

function debounce(fn, num) {
  num = num || 300
  var id
  return function () {
    var args = arguments
      , self = this
    if (id) clearTimeout(id)
    id = setTimeout(function () {
      fn.apply(self, args)
    }, num)
  }
}

function genId(){
  var id = ''
    , chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (var i=0; i<10; i++) {
    id += chars[parseInt(Math.random() * 62, 10)]
  }
  return id
}

function tipMe(el, title, direction) {
  var tip =  new Tip(title)
  if (direction) {
    tip.position(direction, {auto: false})
  }
  el.addEventListener('mouseover', function () {
    tip.show(el)
  })
  el.addEventListener('mouseout', function () {
    tip.hide()
  })
  return tip
}

function initHash(hash) {
  if (!hash || hash == '#') {
    return genId()
  }
  if (!window.location.hash.match(/^#[a-zA-Z0-9]{10}/)) {
    alert("Sorry, file not found. Please check your url")
    window.location = '/'
    return
  }
  return window.location.hash.slice(1)
}

function createZip(tpls, mirrors) {
  var zip = new JSZip()
    , main = zip.folder('prototype')
    , jsf = main.folder("js")
    , cssf = main.folder("css")
    , stylf = main.folder("styl")
    , jadef = main.folder("jade")

  main.file('component.json', tpls.componentjson)
  main.file('Makefile', tpls.makefile)
  jadef.file('index.jade', tpls.outjade)
  jadef.file('proto.jade', mirrors.jade.getValue())
  stylf.file('index.less', 'body { @import "proto.less"; }')
  stylf.file('proto.less', mirrors.less.getValue())
  main.file('index.js', mirrors.xon.getValue())

  return zip.generate({ type: 'blob' })
}

function makeMirror(name, el, mode, store, onChange) {
  var m = ace.edit(el)
  m.setTheme('ace/theme/twilight')
  m.getSession().setMode('ace/mode/' + mode)
  m.setValue('')
  m.clearSelection()
  /*
  new CodeMirror(el, {
    value: '',
    mode: mode,
    theme: 'twilight',
    extraKeys: {
      Tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces, "end", "+input");
      }
    }
  })
  */
  var reloading = true
  var reload = document.querySelector('.' + name + ' > .reload-btn')
  var tip = tipMe(reload, 'Click to disable automatic reload')
  // tip.position('south')
  reload.addEventListener('click', function () {
    reloading = !reloading
    tip.message('Click to ' + (reloading ? 'dis' : 'en') + 'able automatic reload')
    reload.classList[reloading ? 'add' : 'remove']('active')
  })
  var saveBouncer = rebounce(function (text) {
    store.saveOne(name, text, function (err) {
      if (err) {
        console.error('Failed to save ' + name)
      }
    })
  }, 2000)
  m.on('change', debounce(function (change) {
    var text = m.getValue()
    if (reloading) onChange(text)
    saveBouncer(text)
  }))
  return m
}

