"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { ChatInterface } from "@/components/ChatInterface"

export default function ChatPage() {
  const { username } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (username === null) router.replace("/")
  }, [username, router])

  if (!username) return null

  return <ChatInterface />
}
