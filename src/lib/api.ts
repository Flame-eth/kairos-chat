import axios from "axios"
import { Message, PaginatedMessages } from "@/types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
})

export async function fetchMessages(
  limit = 50,
  offset = 0
): Promise<PaginatedMessages> {
  const { data } = await api.get<PaginatedMessages>(
    `/api/messages?limit=${limit}&offset=${offset}`
  )
  return data
}

export async function postMessage(
  sender: string,
  text: string
): Promise<Message> {
  const { data } = await api.post<Message>("/api/messages", { sender, text })
  return data
}
