
/* globals less: true, jade: true, angular: true */

var xon = require('xon')

module.exports = Manager;

function compileXon(txt) {
  /* jshint -W054: false */
  var module = {
    exports: {}
  }
  new Function('require', 'module', txt)(require, module)
  return module.exports
}

function Manager(document){
  var els = {}
    , data = {
        js: '',
        less: '',
        xon: '',
        jade: ''
      }
  ;['output',
    'injected-css'].map(function (id) {
    els[id] = document.getElementById(id)
  })
  this.els = els
  this.data = data
  this.zoomIt = null
  this.lastXon = null
}

Manager.prototype = {
  jade: function (txt, done) {
    if (arguments.length === 0) return this.data.jade
    var parent = this.els.output.parentNode
      , html
    try {
      html = jade.compile(txt)()
    } catch (e) {
      console.error("Jade failed to compile")
      return done('syntax error')
    }
    this.data.jade = txt
    parent.innerHTML = '<div id="output">' + html + '</div>'
    angular.bootstrap((this.els.output = parent.firstChild), ['MyApp'])
    if (this.zoomIt) this.zoomIt(this.els.output)
    done()
  },
  less: function (txt, done) {
    var self = this
    txt = '#output {  ' + txt.replace(/\n/g,'\n  ') + ' }'
    var p = new less.Parser()
    p.parse(txt, function (err, tree) {
      if (err) return done(err)
      self.data.less = txt
      self.els['injected-css'].innerHTML = tree.toCSS()
      done()
    })
  },
  updateXon: function (proto, cached) {
    if (!this.app || !this.scope) {
      // console.error('No fetcher or scope')
      return
    }
    var self = this

    this.scope.loadingData = true
    function gotData(err, data, cached) {
      if (err) {
        console.error('get data fail')
        return
      }
      self.lastXonData = data
      self.scope.loadingData = false
      for (var name in data) {
        if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;
        self.scope[name] = data[name]
      }
      try {
        proto.init(self.scope, self.app)
      } catch (e) {
        console.error('initialize fail')
      }
      if (!cached) self.scope.$digest()
    }

    if (cached) {
      return gotData(null, cached, true)
    }
    try {
      proto.getData(gotData)
    } catch (e) {
      console.log('getdata fail')
      return
    }
    this.scope.$digest()
  },
  xon: function (txt, scope, app) {
    if (arguments.length === 0) return this.data.xon
    var done = function () {}
    if (arguments.length === 3) {
      this.scope = scope
      this.app = app
      if (!txt) {
        if (this.lastXon) {
          return this.updateXon(this.lastXon, this.lastXonData)
        }
        txt = this.data.xon
      }
    } else if (arguments.length == 2) {
      done = scope
    }
    var proto
    try {
      proto = compileXon(txt)
    } catch (e) {
      console.log('xon error!', e)
      done('Failed to compile')
      return false
    }
    if ('function' !== typeof proto.getData || 'function' !== typeof proto.init) {
      done('getData or init not found')
      return false
    }
    done()
    this.data.xon = txt
    this.lastXon = proto
    this.updateXon(proto)
  }
}
