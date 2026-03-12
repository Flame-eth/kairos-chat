"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { Message } from "@/types"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080"

interface UseSocketOptions {
  onMessage: (msg: Message) => void
}

export function useSocket({ onMessage }: UseSocketOptions) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    const socket = io(SOCKET_URL, { autoConnect: true })
    socketRef.current = socket

    socket.on("connect", () => {
      setConnected(true)
      setError(null)
    })

    socket.on("disconnect", () => setConnected(false))

    socket.on("connect_error", () => {
      setError("Connection failed. Retrying...")
      setConnected(false)
    })

    socket.on("message", (msg: Message) => {
      onMessageRef.current(msg)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const sendMessage = (sender: string, text: string) => {
    socketRef.current?.emit("sendMessage", { sender, text })
  }

  return { connected, error, sendMessage }
}
