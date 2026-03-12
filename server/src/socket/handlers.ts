import { Server, Socket } from 'socket.io';
import { createMessage } from '../db/repository';
import { SendMessagePayload } from '../types';

export function registerSocketHandlers(io: Server, socket: Socket): void {
  socket.on('sendMessage', async (payload: SendMessagePayload) => {
    const { sender, text } = payload ?? {};

    if (!sender?.trim() || !text?.trim()) {
      socket.emit('error', { message: 'sender and text are required' });
      return;
    }

    try {
      const message = await createMessage({
        sender: sender.trim(),
        text: text.trim(),
      });
      io.emit('message', message);
    } catch {
      socket.emit('error', { message: 'Failed to save message' });
    }
  });
}
