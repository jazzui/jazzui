
var xon = require('xon')
  , Tip = require('tip')

  , Manager = require('./manager')

  , jadeTpl = require('./tpl/jade.txt')
  , stylusTpl = require('./tpl/stylus.txt')
  , xonTpl = require('./tpl/xon.txt')

  , tpls = {
      jade: jadeTpl,
      stylus: stylusTpl,
      xon: xonTpl,
      outjade: require('./tpl/outjade.txt'),
      outjs: require('./tpl/outjs.txt'),
      makefile: require('./tpl/makefile.txt'),
      componentjson: require('./tpl/componentjson.txt'),
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

function tipMe(el, title) {
  var tip =  new Tip(title)
  el.addEventListener('mouseover', function () {
    tip.show(el)
  })
  el.addEventListener('mouseout', function () {
    tip.hide()
  })
  return tip
}

function getDocs() {
  var docs = []
    , doc
  for (var name in window.localStorage) {
    if (name.slice(0, 'jui.'.length) !== 'jui.') continue;
    if (name.split('.').length > 2) continue;
    try {
      doc = JSON.parse(window.localStorage[name])
      doc.modified = new Date(doc.modified)
      doc.hash = name.slice('jui.'.length)
      docs.push(doc)
    } catch (e) {
      console.error("failed to parse", name)
    }
  }
  return docs
}

module.exports = function (document, window) {
  var CodeMirror = window.CodeMirror
    , angular = window.angular
    , stylus = window.stylus
    , jade = window.jade
    , els = {}
    , reTitle
    , hash

  if (!window.location.hash) {
    hash = genId()
  } else {
    if (!window.location.hash.match(/^#[a-zA-Z0-9]{10}/)) {
      alert("Sorry, file not found. Please check your url")
      return window.location = '/'
    }
    hash = window.location.hash.slice(1)
  }

  window.addEventListener('hashchange', function () {
    if ('#' + hash == window.location.hash) return
    if (!window.location.hash || window.location.hash == '#') {
      hash = genId()
    } else if (!window.location.hash.match(/^#[a-zA-Z0-9]{10}/)) {
      alert("Sorry, file not found. Please check your url")
      return
    } else {
      hash = window.location.hash.slice(1)
    }
    if (reTitle) reTitle()

    mirrors.jm.setValue(window.localStorage['jui.' + hash + '.jade'] || jadeTpl)
    mirrors.sm.setValue(window.localStorage['jui.' + hash + '.stylus'] || stylusTpl)
    mirrors.xm.setValue(window.localStorage['jui.' + hash + '.xon'] || xonTpl)
  })

  ;['jade-mirror',
    'stylus-mirror',
    'xon-mirror'].map(function (id) {
    els[id] = document.getElementById(id)
  })
  
  var manager = new Manager(document, null)

  function makeMirror(name, el, txt, mode, onChange) {
    txt = window.localStorage['jui.' + hash + '.' + name] || txt
    var m = new CodeMirror(el, {
      value: txt,
      mode: mode,
      theme: 'twilight',
      extraKeys: {
        Tab: function(cm) {
          var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
          cm.replaceSelection(spaces, "end", "+input");
        }
      }
    })
    var reloading = true
    var reload = document.querySelector('.' + name + ' > .reload-btn')
    var tip = tipMe(reload, 'Click to disable automatic reload')
    tip.position('south')
    reload.addEventListener('click', function () {
      reloading = !reloading
      tip.message('Click to ' + (reloading ? 'dis' : 'en') + 'able automatic reload')
      reload.classList[reloading ? 'add' : 'remove']('active')
    })
    m.on('change', debounce(function (instance, change) {
      if (window.location.hash != '#' + hash && instance.doc.getValue() !== tpls[name]) {
        window.location.hash = hash
      }
      window.localStorage['jui.' + hash + '.' + name] = instance.doc.getValue()
      var data = {
        name: 'Untitled'
      }
      try {
        data = JSON.parse(window.localStorage['jui.' + hash])
      } catch (e) {}
      window.localStorage['jui.' + hash] = JSON.stringify({
        name: data.name,
        modified: new Date().getTime()
      })
      if (reloading) onChange(instance.doc.getValue())
    }))
    onChange(txt)
    return m
  }

  angular.module('MyApp', [])
    .factory('getData', function () {
      return function (cb) {
        manager.xon(null, cb)
      }
    })
    .controller('MainController', ['$scope', 'getData', function ($scope, getData) {
      getData(function (data, cached) {
        for (var name in data) {
          if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;
          $scope[name] = data[name]
        }
        if (!cached) $scope.$digest()
      })
    }])

  var mirrors = {
    jm: makeMirror('jade', els['jade-mirror'], jadeTpl, 'jade', manager.html.bind(manager)),
    sm: makeMirror('stylus', els['stylus-mirror'], stylusTpl, 'jade', manager.styl.bind(manager)),
    xm: makeMirror('xon', els['xon-mirror'], xonTpl, 'javascript', manager.xon.bind(manager)),
  }

  var app = angular.module('JazzUI', [])
  app.controller('MainController', ['$scope', function ($scope) {
    $scope.docTitle = 'Untitled'
    reTitle = function (norefresh) {
      try {
        $scope.docTitle = JSON.parse(window.localStorage['jui.' + hash]).name
      } catch (e) {}
      if (!norefresh) $scope.$digest()
    }
    reTitle(true)
    $scope.$watch('docTitle', function (value, prev) {
      var data = {
        modified: new Date()
      }
      try {
        data = JSON.parse(window.localStorage['jui.' + hash])
      } catch (e) {}
      data.name = value
      window.localStorage['jui.' + hash] = JSON.stringify(data)
    })
    $scope.download = function () {
      var zip = new JSZip()
        , main = zip.folder('prototype')
        , jsf = main.folder("js")
        , cssf = main.folder("css")
        , stylf = main.folder("styl")
        , jadef = main.folder("jade")

      main.file('component.json', tpls.componentjson)
      main.file('Makefile', tpls.makefile)

      var outjade = tpls.outjade.replace('/** INJECT **/', mirrors.jm.getValue().replace(/\n/g, '\n    '))
      jadef.file('index.jade', outjade)
      var outstyl = 'body\n  ' + mirrors.sm.getValue().replace(/\n/g, '\n  ')
      stylf.file('index.styl', outstyl)
      var outjs = tpls.outjs.replace('/** INJECT **/', mirrors.xm.getValue().replace(/\n/g, '\n        '))
      main.file('index.js', outjs)

      var blob = zip.generate({ type: 'blob' })
      document.getElementById('download-link').href = window.URL.createObjectURL(blob);
      $scope.showDlDialog = true
    }
    $scope.closeDlDialog = function () {
      $scope.showDlDialog = false
    }
    $scope.open = function () {
      $scope.docs = getDocs()
      $scope.showOpenDialog = true
    }
    $scope.openDoc = function (doc) {
      window.location.hash = doc.hash
      $scope.showOpenDialog = false
    }
    $scope.removeDoc = function (doc) {
      var names = Object.keys(window.localStorage)
      for (var i=0; i<names.length; i++) {
        if (names[i].indexOf('jui.' + doc.hash) === 0) {
          window.localStorage.removeItem(names[i])
        }
      }
      $scope.docs = getDocs()
    }
    $scope.closeOpenDialog = function () {
      $scope.showOpenDialog = false
    }

    $scope.duplicate = function () {
      var id = genId()
        , pref = 'jui.' + id
      window.localStorage[pref] = window.localStorage[hash]
      window.localStorage[pref + '.jade'] = mirrors.jm.getValue()
      window.localStorage[pref + '.stylus'] = mirrors.sm.getValue()
      window.localStorage[pref + '.xon'] = mirrors.xm.getValue()
      window.location.hash = id
    }
    
  }]).directive("toggle", function() {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        if (attrs.toggle !== 'tooltip') return;
        var tip
        setTimeout(function() {
          tip = tipMe(element[0], element.attr('title'))
        }, 0);
        attrs.$observe('title', function () {
          if (tip) tip.message(element.attr('title'))
        });
        scope.$on('$destroy', function () {
          tip.hide()
        });
      }
    };
  })

  angular.bootstrap(document.getElementById("interaction"), ["JazzUI"])

}
