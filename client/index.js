
var xon = require('xon')

  , jadeTpl = require('./tpl/jade.txt')
  , stylusTpl = require('./tpl/stylus.txt')
  , xonTpl = require('./tpl/xon.txt')

function compileXon(txt) {
  var data = new Function('x', txt)(xon)
  return xon(data)
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

module.exports = function (document, window) {
  var CodeMirror = window.CodeMirror
    , angular = window.angular
    , stylus = window.stylus
    , jade = window.jade
    , els = {}

  ;['jade-mirror', 'stylus-mirror', 'xon-mirror', 'output', 'injected-css'].map(function (id) {
    els[id] = document.getElementById(id)
  })

  function updateHtml(txt) {
    var html, parent = els.output.parentNode
    try {
      html = jade.compile(txt)()
    } catch (e) {
      return
    }
    parent.innerHTML = '<div id="output">' + html + '</div>'
    angular.bootstrap((els.output = parent.firstChild), ['MyApp'])
  }
  function updateStyle(txt) {
    txt = '#output\n  ' + txt.replace(/\n/g,'\n  ')
    stylus(txt).render(function (err, css) {
      if (css) els['injected-css'].innerHTML = css
    })
  }

  var html = debounce(updateHtml)
    , style = debounce(updateStyle)
    , dexon = debounce(updateXon)
  var jm = new CodeMirror(els['jade-mirror'], {
    value: jadeTpl,
    mode: 'jade',
    theme: 'twilight',
    extraKeys: {
      Tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces, "end", "+input");
      }
    }
  })
  jm.on('change', function (instance, change) {
    html(instance.doc.getValue())
  })
  var sm = new CodeMirror(els['stylus-mirror'], {
    value: stylusTpl,
    mode: 'jade',
    theme: 'twilight',
    extraKeys: {
      Tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces, "end", "+input");
      }
    }
  })
  sm.on('change', function (instance, change) {
    style(instance.doc.getValue())
  })
  var xm = new CodeMirror(els['xon-mirror'], {
    value: xonTpl,
    mode: 'javascript',
    theme: 'twilight',
    extraKeys: {
      Tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces, "end", "+input");
      }
    }
  })
  xm.on('change', function (instance, change) {
    dexon(instance.doc.getValue())
  })

  function updateXon(txt) {
    if (!dataFetcher) return
    try {
      cxon = compileXon(txt)
    } catch (e) {
      return
    }
    dataFetcher(cxon)
  }

  var cxon = compileXon(xonTpl)
    , dataFetcher

  angular.module('MyApp', [])
    .factory('getData', function () {
      return function (cb) {
        cb(cxon, true)
        dataFetcher = cb
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

  updateHtml(jadeTpl)
  updateStyle(stylusTpl)
}
