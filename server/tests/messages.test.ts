import request from 'supertest';
import { app } from '../src/index';
import * as repo from '../src/db/repository';

jest.mock('../src/db/repository');

const mockGetMessages = repo.getMessages as jest.MockedFunction<
  typeof repo.getMessages
>;
const mockCreateMessage = repo.createMessage as jest.MockedFunction<
  typeof repo.createMessage
>;

const sampleMessage = {
  id: 1,
  sender: 'Alice',
  text: 'Hello!',
  createdAt: new Date('2024-01-01T12:00:00Z'),
};

describe('GET /api/messages', () => {
  it('returns 200 with paginated messages', async () => {
    mockGetMessages.mockResolvedValue([sampleMessage]);

    const res = await request(app).get('/api/messages');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].sender).toBe('Alice');
    expect(res.body.limit).toBe(50);
    expect(res.body.offset).toBe(0);
  });

  it('respects limit and offset query params', async () => {
    mockGetMessages.mockResolvedValue([]);

    const res = await request(app).get('/api/messages?limit=10&offset=20');

    expect(res.status).toBe(200);
    expect(mockGetMessages).toHaveBeenCalledWith(10, 20);
    expect(res.body.limit).toBe(10);
    expect(res.body.offset).toBe(20);
  });

  it('caps limit at 100', async () => {
    mockGetMessages.mockResolvedValue([]);

    await request(app).get('/api/messages?limit=999');

    expect(mockGetMessages).toHaveBeenCalledWith(100, 0);
  });

  it('returns 500 when repository throws', async () => {
    mockGetMessages.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/messages');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/messages', () => {
  it('creates and returns a message with 201', async () => {
    mockCreateMessage.mockResolvedValue(sampleMessage);

    const res = await request(app)
      .post('/api/messages')
      .send({ sender: 'Alice', text: 'Hello!' });

    expect(res.status).toBe(201);
    expect(res.body.sender).toBe('Alice');
    expect(res.body.text).toBe('Hello!');
  });

  it('strips whitespace from sender and text', async () => {
    mockCreateMessage.mockResolvedValue(sampleMessage);

    await request(app)
      .post('/api/messages')
      .send({ sender: '  Alice  ', text: '  Hello!  ' });

    expect(mockCreateMessage).toHaveBeenCalledWith({
      sender: 'Alice',
      text: 'Hello!',
    });
  });

  it('returns 400 when sender is missing', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ text: 'Hello!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sender/);
  });

  it('returns 400 when sender is empty string', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ sender: '   ', text: 'Hello!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sender/);
  });

  it('returns 400 when text is missing', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ sender: 'Alice' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/text/);
  });

  it('returns 400 when text is empty string', async () => {
    const res = await request(app)
      .post('/api/messages')
      .send({ sender: 'Alice', text: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/text/);
  });

  it('returns 500 when repository throws', async () => {
    mockCreateMessage.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/messages')
      .send({ sender: 'Alice', text: 'Hello!' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
