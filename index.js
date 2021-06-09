const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
    },
});
// app.use(cors())
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'https://60c138aee1f3120db0ef551e--friendly-hugle-39da6b.netlify.app/');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });
app.use(cors({origin: '*'}));

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
var server_port = process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
server.listen(server_port, server_host, function () {
    console.log('Listening on port %d', server_port);
});
