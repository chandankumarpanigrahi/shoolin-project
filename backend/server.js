import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single ENV File: Load .env.local from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config(); // fallback

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3001';
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);
app.use(express.json());

// Socket.io Real-time Setup
const io = new SocketIOServer(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`⚡ Client connected to Socket.io: ${socket.id}`);

  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Client ${socket.id} joined room project:${projectId}`);
  });

  socket.on('leave_project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Broadcast helper
export function broadcastRealtimeEvent(event, data, room = null) {
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
}

import apiRoutes from './routes/api.routes.js';

// Register API Router
app.use('/api', apiRoutes);


// Boot Server
async function start() {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`
🚀 Shoolin Operations OS Server running on http://localhost:${PORT}
⚡ Socket.io WebSocket server initialized
📡 Configured for Next.js client at ${CLIENT_URL}
    `);
  });
}

start();
