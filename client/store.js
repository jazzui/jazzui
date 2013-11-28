
var request = require('superagent')

module.exports = {
  LocalStore: LocalStore,
  ApiStore: ApiStore
}

function ApiStore(base) {
  this.base = base || '/'
  this.onerror = null
  // throw new Error("Not Implemented")
}

ApiStore.prototype = {
  // [{name:, modified:, hash:}, ...]
  list: function (done) {
    request.get(this.base + 'project/')
      .end(function (res) {
        if (res.status !== 200) {
          return done(new Error(res.text))
        }
        for (var i=0; i<res.body.length; i++) {
          res.body[i].modified = new Date(res.body[i].modified)
        }
        done(null, res.body)
      })
  },
  remove: function (hash, done) {
    request.del(this.base + 'project/' + hash)
      .end(function (res) {
        if (res.status !== 200) {
          return done(new Error(res.text))
        }
        done(null, res.body)
      })
  },
  get: function (hash, done) {
    request.get(this.base + 'project/' + hash)
      .end(function (res) {
        if (res.status !== 200) {
          if (res.status === 404) {
            return done(new Error('Server not running'))
          }
          return done(new Error(res.text))
        }
        done(null, res.body.info && res.body.info.name, res.body.docs)
      })
  },
  put: function (hash, data, done) {
    request.post(this.base + 'project/' + hash)
      .send(data)
      .end(function (res) {
        if (res.status > 299) {
          if (res.status === 404) {
            return done(new Error('Server not running'))
          }
          return done(new Error(res.text))
        }
        done()
      })
  },
  saveName: function (hash, name, done) {
    if (arguments.length === 2) {
      done = name
      name = hash
      hash = this.currentHash
    }
    this.put(hash, {name: name}, done)
  },
  save: function (id, name, data, done) {
    if (arguments.length === 3) {
      done = data
      data = name
      name = id
      id = this.currentHash
    }
    this.put(id, {name: name, docs: data}, done)
  },
  saveOne: function (id, type, txt, done) {
    if (arguments.length === 3) {
      done = txt
      txt = type
      type = id
      id = this.currentHash
    }
    var doc = {}
    doc[type] = txt
    this.put(id, {docs: doc}, done)
  }
}

// ls: window.localStorage
function LocalStore(ls) {
  this.ls = ls
  this.currentHash = null
}

// saved: {
//   name:
//   modified:
// }
LocalStore.prototype = {
  // [{name:, modified:, hash:}, ...]
  list: function (done) {
    var docs = []
      , doc
    for (var name in this.ls) {
      if (name.slice(0, 'jui.'.length) !== 'jui.') continue;
      if (name.split('.').length > 2) continue;
      try {
        doc = JSON.parse(this.ls[name])
        doc.modified = new Date(doc.modified)
        doc.hash = name.slice('jui.'.length)
        docs.push(doc)
      } catch (e) {
        console.error("failed to parse", name)
      }
    }
    done(null, docs, true)
  },
  remove: function (hash, done) {
    var names = Object.keys(this.ls)
    for (var i=0; i<names.length; i++) {
      if (names[i].indexOf('jui.' + hash) === 0) {
        this.ls.removeItem(names[i])
      }
    }
    this.list(done)
  },
  // {hash:, name:, jade:, less:, xon:, modified:}
  get: function (hash, done) {
    if (arguments.length === 1) {
      done = hash
      hash = this.currentHash
    }
    var pref = 'jui.' + hash
      , name = 'Untitled'
    try {
      name = JSON.parse(this.ls[pref]).name
    } catch (e) {
      console.error("failed to get title")
    }
    done(
      null,
      name,
      {
        less: this.ls[pref + '.less'],
        jade: this.ls[pref + '.jade'],
        xon: this.ls[pref + '.xon'],
      },
      true
    )
  },
  saveName: function (id, name, done) {
    if (arguments.length === 2) {
      done = name
      name = id
      id = this.currentHash
    }
    var pref = 'jui.' + id
    this.ls[pref] = JSON.stringify({
      name: name,
      modified: new Date()
    })
    done()
  },
  // done(err)
  save: function (id, name, data, done) {
    if (arguments.length === 3) {
      done = data
      data = name
      name = id
      id = this.currentHash
    }
    var pref = 'jui.' + id
    this.ls[pref] = JSON.stringify({
      name: name,
      modified: new Date()
    })
    this.ls[pref + '.less'] = data.less
    this.ls[pref + '.jade'] = data.jade
    this.ls[pref + '.xon'] = data.xon
    done(null, true)
  },
  // type is one of less, jade, xon
  saveOne: function (id, type, txt, done) {
    if (arguments.length === 3) {
      done = txt
      txt = type
      type = id
      id = this.currentHash
    }
    var pref = 'jui.' + id
    this.ls[pref + '.' + type] = txt
    var data = {
      name: 'Untitled'
    }
    try {
      data = JSON.parse(this.ls['jui.' + id])
    } catch (e) {
      console.error('Not yet saved')
    }
    this.ls['jui.' + id] = JSON.stringify({
      name: data.name,
      modified: new Date().getTime()
    })
    done(null)
  }
}
