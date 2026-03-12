import { asc } from 'drizzle-orm';
import { db } from './client';
import { messages, Message, NewMessage } from './schema';

export async function getMessages(
  limit: number,
  offset: number,
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .orderBy(asc(messages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createMessage(data: NewMessage): Promise<Message> {
  const [message] = await db.insert(messages).values(data).returning();
  return message;
}
