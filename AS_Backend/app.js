var express = require('express')

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongodb connected')
});

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var clientsRouter = require('./routes/clients')

var app = express()

let bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

let cors = require('cors')
app.use(cors())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/clients', clientsRouter)

module.exports = app;
