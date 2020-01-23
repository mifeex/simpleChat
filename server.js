const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql2');

const users = {}; // создаем объект пользователей

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/user', function(req, res){
  res.sendFile(__dirname + '/public/user.html');
});

io.on('connection', (socket) => { // при подключении берем данные переданные с клиента

  socket.on('chat-message', (msg) => {

    socket.broadcast.emit('chat-message',{msg: msg, name:
    users[socket.id]}); // отправляем "испускаем (от англ. emit)" данные на клиент !видят только другие пользователи
  });

  socket.on('new-user', (name) => {
    users[socket.id] = name; // добавляем пользователя в объект
    socket.broadcast.emit('user-connected', name) // отправляем имя на клиент !видное только другим пользователям
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });

  socket.on('is-typing', () => {
    socket.broadcast.emit('typing', users[socket.id])
  })
});

http.listen(8000, function(){
  console.log('listening on *:8000');
});