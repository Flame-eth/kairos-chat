import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { registerSocketHandlers } from '../src/socket/handlers';
import * as repo from '../src/db/repository';

jest.mock('../src/db/repository');

const mockCreateMessage = repo.createMessage as jest.MockedFunction<
  typeof repo.createMessage
>;

describe('Socket.io handlers', () => {
  let ioServer: Server;
  let clientSocket: ClientSocket;
  let clientSocket2: ClientSocket;
  let serverPort: number;

  beforeAll((done) => {
    const httpServer = createServer();
    ioServer = new Server(httpServer, { cors: { origin: '*' } });

    httpServer.listen(0, () => {
      const addr = httpServer.address() as { port: number };
      serverPort = addr.port;

      clientSocket = ioc(`http://localhost:${serverPort}`);
      clientSocket2 = ioc(`http://localhost:${serverPort}`);

      ioServer.on('connection', (socket) => {
        registerSocketHandlers(ioServer, socket);
      });

      // Wait for both clients to connect
      let connected = 0;
      const onConnect = () => { if (++connected === 2) done(); };
      clientSocket.on('connect', onConnect);
      clientSocket2.on('connect', onConnect);
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.disconnect();
    clientSocket2.disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('broadcasts message to all clients on sendMessage (happy path)', (done) => {
    const savedMsg = {
      id: 1,
      sender: 'Alice',
      text: 'Hello!',
      createdAt: new Date('2024-01-01T12:00:00Z'),
    };
    mockCreateMessage.mockResolvedValue(savedMsg);

    clientSocket.emit('sendMessage', { sender: 'Alice', text: 'Hello!' });

    clientSocket.once('message', (msg) => {
      expect(msg.sender).toBe('Alice');
      expect(msg.text).toBe('Hello!');
      expect(mockCreateMessage).toHaveBeenCalledWith({
        sender: 'Alice',
        text: 'Hello!',
      });
      done();
    });
  });

  it('emits error when sender is missing', (done) => {
    clientSocket.emit('sendMessage', { sender: '', text: 'Hello!' });

    clientSocket.once('error', (err) => {
      expect(err.message).toBeDefined();
      done();
    });
  });

  it('emits error when text is missing', (done) => {
    clientSocket.emit('sendMessage', { sender: 'Alice', text: '' });

    clientSocket.once('error', (err) => {
      expect(err.message).toBeDefined();
      done();
    });
  });

  it('emits error when repository throws', (done) => {
    mockCreateMessage.mockRejectedValue(new Error('DB failure'));

    clientSocket.emit('sendMessage', { sender: 'Alice', text: 'Hello!' });

    clientSocket.once('error', (err) => {
      expect(err.message).toMatch(/Failed/);
      done();
    });
  });

  it('broadcasts typing event to other clients', (done) => {
    // clientSocket emits typing; clientSocket2 should receive it
    clientSocket2.once('typing', (payload) => {
      expect(payload.sender).toBe('Alice');
      expect(payload.isTyping).toBe(true);
      done();
    });

    clientSocket.emit('typing', { sender: 'Alice', isTyping: true });
  });

  it('does not broadcast typing event back to the sender', (done) => {
    // clientSocket should NOT receive its own typing broadcast
    const timeout = setTimeout(done, 300); // pass if no event within 300ms
    clientSocket.once('typing', () => {
      clearTimeout(timeout);
      done(new Error('Sender should not receive its own typing event'));
    });

    clientSocket.emit('typing', { sender: 'Alice', isTyping: true });
  });

  it('ignores typing event with missing sender', (done) => {
    const timeout = setTimeout(done, 300);
    clientSocket2.once('typing', () => {
      clearTimeout(timeout);
      done(new Error('Should not broadcast typing with empty sender'));
    });

    clientSocket.emit('typing', { sender: '', isTyping: true });
  });
});
