var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(fs.readFileSync('./index.html', 'utf-8'));
}).listen(3000);

var io = socketio.listen(server);

var rooms = [];
var messages = {};

io.on('connection', function(socket) {

    io.emit('fetch rooms', rooms);

    socket.on('create room', function(data) {
        rooms.push(data.room_id);
        socket.join(data.room_id);
        io.emit('fetch rooms', rooms);
    });

    socket.on('join', function(data) {
        socket.join(data.room_id);
        io.emit('fetch rooms', rooms);
    });

    socket.on('fetch message', function(room_id) {
        io.to(socket.id).emit('chat message init', messages[room_id]);
    });

    socket.on('chat message', function(data) {
        messages[data.room_id] = messages[data.room_id] || [];
        var log = {
            user_name: data.user_name,
            message: data.message
        };
        messages[data.room_id].push(log);
        io.to(data.room_id).emit('chat message', {
            room_id: data.room_id,
            log: log
        });
    });
});
