
var xon = require('xon')

  , Manager = require('./manager')

  , jadeTpl = require('./tpl/jade.txt')
  , stylusTpl = require('./tpl/stylus.txt')
  , xonTpl = require('./tpl/xon.txt')

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

  ;['jade-mirror',
    'stylus-mirror',
    'xon-mirror'].map(function (id) {
    els[id] = document.getElementById(id)
  })
  
  var manager = new Manager(document, null)

  var mirrors = {
    jm: makeMirror(els['jade-mirror'], jadeTpl, 'jade', manager.html.bind(manager)),
    sm: makeMirror(els['styl-mirror'], stylusTpl, 'jade', manager.styl.bind(manager)),
    xm: makeMirror(els['xon-mirror'], xonTpl, 'javascript', manager.xon.bind(manager)),
  }

  function makeMirror(el, txt, mode, change) {
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
    m.on('change', debounce(function (instance, change) {
      change(instance.doc.getValue())
    }))
    return m
  }

  angular.module('MyApp', [])
    .factory('getData', function () {
      return function (cb) {
        manager.xon(xonTpl, cb)
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

}
