'use strict'

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const colors = ["#0074D9", "#001f3f", "#7FDBFF", "#39CCCC", "#3D9970","#2ECC40","#01FF70","#FFDC00","#FF851B","#FF4136","#85144b","#F012BE","#B10DC9"];

var usersSockets = [];

function UserModel(data){
    if(!data.socket) return {error:"No Socket data given"};
    
    this.id= data.socket.id;
    this.name = data.name || '';
    this.color = data.color || '';
    this.socket = data.socket;
};

function socketMapper (options){
  options = options || {};

  return options.socket ? {
      id: options.socket.id,
      name: options.name || '',
      color: options.color || ''
    } : {};
};

app.get('/', function(req, res){
    res.sendfile('index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){
    console.log('a user connected');
    // console.log(socket);
    var color = colors[Math.floor(Math.random() * colors.length)];
    var user = new UserModel({socket:socket, color: color});

    socket.on('set name', function(data){
        user.name = data.name || "";
        if(user.name){
            usersSockets.push(user);
            io.emit('server notify', "Users online "+usersSockets.length);        
            socket.emit('admin message', "Welcome "+user.name+"!");
            
            socket.emit('got name', {"_set" : true, "user": socketMapper(user)});
            // socket.emit("got user", socketMapper(user));
        }
            
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', {message:msg, user:socketMapper(user)});
    });

    
    socket.emit('admin message', "Plaes write a name for you!");
    socket.emit('get color', color);
   
});
