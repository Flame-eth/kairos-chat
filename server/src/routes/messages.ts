import { Router, Request, Response } from 'express';
import { getMessages, createMessage } from '../db/repository';

const router = Router();

// GET /api/messages?limit=50&offset=0
router.get('/', async (req: Request, res: Response) => {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 50, 1),
    100,
  );
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  try {
    const data = await getMessages(limit, offset);
    res.json({ data: data.reverse(), limit, offset });
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages
router.post('/', async (req: Request, res: Response) => {
  const { sender, text } = req.body;

  if (!sender || typeof sender !== 'string' || sender.trim().length === 0) {
    res
      .status(400)
      .json({ error: 'sender is required and must be a non-empty string' });
    return;
  }
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res
      .status(400)
      .json({ error: 'text is required and must be a non-empty string' });
    return;
  }

  try {
    const message = await createMessage({
      sender: sender.trim(),
      text: text.trim(),
    });
    res.status(201).json(message);
  } catch {
    res.status(500).json({ error: 'Failed to create message' });
  }
});

export default router;
