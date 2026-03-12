export interface Message {
  id: number
  sender: string
  text: string
  createdAt: string
}

export interface PaginatedMessages {
  data: Message[]
  limit: number
  offset: number
}
