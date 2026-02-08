const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this for production
        methods: ["GET", "POST"]
    }
});

// Attach io to app so it can be used in controllers
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('🔌 New Client Connected:', socket.id);

    socket.on('join_room', (roomName) => {
        if (roomName) {
            socket.join(roomName);
            console.log(`🏠 Socket ${socket.id} joined room: ${roomName}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Client Disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});
