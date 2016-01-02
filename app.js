var path = require('path');
var express = require('express');
var routes = require('./routes');
var settings = require('./settings');
var MongoStore = require('connect-mongo')(express);
var app = module.exports = express.createServer();
var io = require('socket.io')(app);

io.on('connection', function(socket) {
  console.log('connection establish');
  console.log('socket: ' + socket.request.connection.remoteAddress);

  socket.on('say', function(data) {
    console.log(data.user);
    console.log(data.content);
    io.sockets.emit('message', data);
  });
});

app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.methodOverride());
  app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: __dirname + '/upload'
  }));
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      url: settings.url,
      db: settings.db
    })
  }));
  app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public/sass'),
    dest: path.join(__dirname, 'public/css'),
    indentedSyntax: true,
    sourceMap: true
  }));
  app.use(express.router(routes));
  app.use(express.static(__dirname + '/public/javascripts'));
  app.use(express.static(__dirname + '/public/css'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/node_modules/material-design-icons-iconfont/dist/'));
  app.use(express.static(__dirname + '/node_modules/socket.io-client/'));
  app.use(express.static(__dirname + '/node_modules/jquery/dist'));
  app.use(express.static(__dirname + '/node_modules/bootstrap/dist/js'));
  app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.dynamicHelpers({
  user: function(req, res) {
    return req.session.user;
  },
  error: function(req, res) {
    var err = req.flash('error');
    if (err.length)
      return err;
    else
      return null;
  },
  success: function(req, res) {
    var succ = req.flash('success');
    if (succ.length)
      return succ;
    else
      return null;
  },
});

app.listen(settings.debugPort);
console.log("Express server listening on port %d in %s mode",
            app.address().port, app.settings.env);

