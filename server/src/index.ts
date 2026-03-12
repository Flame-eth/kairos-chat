import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import messagesRouter from './routes/messages';
import { registerSocketHandlers } from './socket/handlers';

const app = express();
const httpServer = createServer(app);

const PORT = parseInt(process.env.PORT ?? '8080', 10);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use('/api/messages', messagesRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);
  registerSocketHandlers(io, socket);
  socket.on('disconnect', () => {
    console.log(`[socket] Client disconnected: ${socket.id}`);
  });
});

export { app, httpServer, io };

if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
}
