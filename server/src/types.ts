export interface Message {
  id: number;
  sender: string;
  text: string;
  createdAt: Date;
}

export interface SendMessagePayload {
  sender: string;
  text: string;
}

export interface TypingPayload {
  sender: string;
  isTyping: boolean;
}

export interface PaginatedMessages {
  data: Message[];
  limit: number;
  offset: number;
  total?: number;
}
