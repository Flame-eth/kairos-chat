import { Message, PaginatedMessages } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export async function fetchMessages(
  limit = 50,
  offset = 0
): Promise<PaginatedMessages> {
  const res = await fetch(
    `${API_URL}/api/messages?limit=${limit}&offset=${offset}`
  )
  if (!res.ok) throw new Error("Failed to fetch messages")
  return res.json()
}

export async function postMessage(
  sender: string,
  text: string
): Promise<Message> {
  const res = await fetch(`${API_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, text }),
  })
  if (!res.ok) throw new Error("Failed to post message")
  return res.json()
}
