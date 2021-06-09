const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});
let users = [];
io.on('connection', (socket) => {
    let clientId = socket.id;
    socket.on('join', (user) => {
        socket.broadcast.emit('message', {
            user,
            message: `${user.username} has joined chat!`,
        });
    });
    socket.on('message', ({user, message}) => {
        io.emit('message', {user, message});
    });
    socket.on('users', (user) => {
        user['clientId'] = clientId;
        users = [...users, user];
        io.emit('users', users);
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
        io.emit('users', users);
    });
});

app.listen(process.env.PORT || 5000, () => console.log('Server is running...'));
