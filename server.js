// server.js
const express = require('express');
const app = express();
const server = require('http').Server(app);

// use css and javascript
app.use(express.static('public'));

// use socket.io and peer.js
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use('/peerjs', peerServer);

// create room id and redirect to the room
const { v4: uuidv4 } = require("uuid");
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
app.get('/:room', (req, res) => {
    console.log(" room " + req.params.room);
    res.render('room', { roomId: req.params.room });
});

// set ejs template engine
app.set('view engine', 'ejs')

// socket io - on connection on join-room join the room and emit user connected to the room.
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId, userName) => {
        console.log(`User Joined ${userName} ${userId}`);    
        socket.join(roomId);
        console.log(roomId);
        socket.broadcast.emit('user-connected', userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
}); 

server.listen(3030);