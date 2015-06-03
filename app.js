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
app.set('view options', {
    layout: false
});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.static('public'));
app.use(express.bodyParser());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/', routes.index);
app.get('/:name', routes.index);
app.get('/:name/:room', routes.meeting);

var server = http.createServer(app);
var io = socketio.listen(server);

console.log("begin");
var sockets = [];
var rooms = [];

app.set('rooms', rooms);


io.on('connection', function (socket) {
    console.log("connection " + sockets.length);
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      console.log("disconnect");
    });
    
    socket.on('vote', function(name, hours, minutes) {
      console.log("received vote " + hours + " " + minutes + " from " + name + "'s room");
      
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].leaderName == name) {
          rooms[i].votes.push(toMinutes(hours, minutes));    
          console.log(rooms[i].votes);
          io.sockets.emit('vote-data', name, rooms[i].votes);
        }
      }
      console.log(rooms);
      
    });
    
    socket.on('start', function(name) {
      io.sockets.emit('start', name);
    })
    
    socket.on('end', function(name) {
      io.sockets.emit('end', name);
    })
    
    socket.on('create', function(name, meetingName) {
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].leaderName == name) {
          rooms[i].meetingName = meetingName;
          break;
        }
      }
    })

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