var NUM_VOTES = 3;
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('ip', process.env.IP || "0.0.0.0");
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/:num', routes.index);
var server = http.createServer(app);
var io = socketio.listen(server);

console.log("begin");
var sockets = [];
var votes_in_minutes = [];


io.on('connection', function (socket) {
    console.log("connection " + sockets.length);
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      console.log("disconnect");
    });
    
    socket.on('vote', function(hours, minutes) {
      votes_in_minutes.push(toMinutes(hours, minutes));
      console.log(votes_in_minutes);
      
      if(votes_in_minutes.length >= NUM_VOTES) {
        console.log("all votes received");
        io.sockets.emit('vote-data', votes_in_minutes);
      }
    });

  });

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

function toMinutes(hours, minutes) {
  return parseInt(hours) * 60 + parseInt(minutes);
}

function votesReceived() {
  for (var x = 0; x < sockets.length; x++) {
    sockets[x]
  }
}