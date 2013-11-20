
/* globals stylus: true, jade: true, angular: true */

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
        styl: '',
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
  jade: function (txt) {
    if (arguments.length === 0) return this.data.jade
    var parent = this.els.output.parentNode
      , html
    try {
      html = jade.compile(txt)()
    } catch (e) {
      console.error("Jade failed to compile")
      return
    }
    this.data.jade = txt
    parent.innerHTML = '<div id="output">' + html + '</div>'
    angular.bootstrap((this.els.output = parent.firstChild), ['MyApp'])
    if (this.zoomIt) this.zoomIt(this.els.output)
  },
  stylus: function (txt) {
    var self = this
    txt = '#output\n  ' + txt.replace(/\n/g,'\n  ')
    stylus(txt).render(function (err, css) {
      if (!css) return
      self.data.styl = txt
      self.els['injected-css'].innerHTML = css
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
    if (arguments.length === 3) {
      this.scope = scope
      this.app = app
      if (!txt) {
        if (this.lastXon) {
          return this.updateXon(this.lastXon, this.lastXonData)
        }
        txt = this.data.xon
      }
    }
    var proto
    try {
      proto = compileXon(txt)
    } catch (e) {
      console.log('xon error!', e)
      return false
    }
    if ('function' !== typeof proto.getData || 'function' !== typeof proto.init) {
      return false
    }
    this.data.xon = txt
    this.lastXon = proto
    this.updateXon(proto)
  }
}
