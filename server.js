
var server = require('./lib/app')
  , DB = process.env.MONGO_URI || 'mongodb://localhost/jazzui'

server(DB).listen(3000)

