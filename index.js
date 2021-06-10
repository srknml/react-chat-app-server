const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: 'https://schude-chat-app.netlify.app/',
        methods: ['GET', 'POST'],
    },
});
// const io = socketio(server, {
//     cors: {
//       origin: "https://schude-chat-app.netlify.app/",
//       methods: ["GET", "POST"],
//       allowedHeaders: ["my-custom-header"],
//       credentials: true
//     }
//   });

let users = [];
io.on('connection', (socket) => {
    let clientId = socket.id;
    socket.on('join', (user) => {
        user['clientId'] = clientId;
        users = [...users, user];

        socket.emit('currentUser', user);
        io.emit('updateUsers', users);

        socket.broadcast.emit('message', {
            user,
            message: `${user.username} has joined chat!`,
        });
    });
    socket.on('message', (body) => {
        io.emit('message', body);
    });
    socket.on('disconnect', () => {
        let disconnectedUser = users.find((user) => {
            return user.clientId === clientId;
        });
        users = users.filter((user) => {
            return user.clientId !== clientId;
        });

        io.emit('message', {
            user: disconnectedUser,
            message: `${disconnectedUser.username} has left chat!`,
        });
        io.emit('updateUsers', users);
    });
});
var server_port = process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
server.listen(server_port, server_host, function () {
    console.log('Listening on port ', server_port);
});
