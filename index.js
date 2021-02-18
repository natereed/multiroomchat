const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.get('/room/:id', function(req, res) {
    id = req.params.id;
    res.render('index.ejs', {
        roomId: id
    });
});

io.sockets.on('connection', function(socket) {
    socket.on('username', function(roomId, username) {
        socket.username = username;
        socket.roomId = roomId;
        // Join room here:
        socket.join(roomId);
        io.to(roomId).emit('is_online', '<i>' + socket.username + ' joined ' + roomId + '.</i>');
    });

    socket.on('disconnect', function(username) {
        // Should the room id come from socket or from the emitted message (function arg)?
        io.to(socket.roomId).emit('is_online', '<i>' + socket.username + ' left ' + socket.roomId + '.</i>');
        // Leave room
        socket.leave(socket.roomId);
    })

    socket.on('chat_message', function(message) {
        io.to(socket.roomId).emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

});

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});
