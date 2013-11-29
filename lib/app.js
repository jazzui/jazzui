var MongoClient = require('mongodb').MongoClient
  , express = require('express')
  , async = require('async')

function list(req, res) {
  req.db.collection('project').find({archived:false}).toArray(function (err, results) {
    if (err) {
      console.log('err fetching projects', err)
      return res.send('Failed to fetch projects')
    }
      res.send(results)
  })
}

function get(req, res) {
  async.parallel({
    info: function (next) {
      req.db.collection('project').findOne({hash: req.params.id}, next)
    },
    docs: function (next) {
      req.db.collection('document').find({hash: req.params.id}).toArray(function (err, docs) {
        if (err) return next(err)
        var org = {}
        for (var i=0; i<docs.length; i++) {
          org[docs[i].type] = docs[i].contents
        }
        next(null, org)
      })
    }
  }, function (err, data) {
    if (err) return res.send(500, 'Failed to retrieve data')
      res.send(data)
  })
}

function del(req, res) {
  req.db.collection('project')
  .update({hash: req.params.id}, {$set:{archived: new Date()}}, function (err) {
    if (err) return res.send(500, 'Failed to archive')
      list(req, res)
  })
}

function put(req, res) {
  var tasks = []
  if (req.body.name) {
    tasks.push(function (next) {
      req.db.collection('project').update({hash: req.params.id}, {$set: {
        name: req.body.name,
        modified: new Date(),
        archived: false
      }}, {upsert: true}, next)
    })
  }
  function upDoc(type, contents, next) {
    req.db.collection('document').update({
      hash: req.params.id,
      type: type,
    }, {
      $set: {
        modified: new Date(),
        contents: contents
      }
    }, {upsert: true}, next)
  }
  if (req.body.docs) {
    for (var name in req.body.docs) {
      tasks.push(upDoc.bind(null, name, req.body.docs[name]))
    }
  }
  async.parallel(tasks, function (err) {
    if (err) return res.send(500, 'Failed to save')
    res.send(204)
  })
}


module.exports = function (DB, password) {

  var express = require('express')
    , app = express()
  if (password) {
    app.use(express.basicAuth('jazzui', password))
  }
  app.use(express.logger('dev'))
  app.use(require('cors')())
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/../web'))
  app.use(function (req, res, next) {
    MongoClient.connect(DB, function (err, db) {
      if (err) return res.send(500, 'Failed to connect to the database')
        req.db = db
      next()
    })
  })
  app.get('/project/', list)
  app.get('/project/:id', get)
  app.del('/project/:id', del)
  app.post('/project/:id', put)

  return app
}

