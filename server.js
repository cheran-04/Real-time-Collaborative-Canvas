const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// --- SERVER MEMORY ---
// This array acts as our "Database" for now.
const drawingHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 1. WHEN NEW USER JOINS: Send them the existing history
    // We loop through the history and send every single line to the new user.
    drawingHistory.forEach(line => {
        socket.emit('draw', line);
    });

    // 2. WHEN USER DRAWS:
    socket.on('draw', (data) => {
        // A. Save to memory
        drawingHistory.push(data);

        // B. Broadcast to everyone else
        socket.broadcast.emit('draw', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
