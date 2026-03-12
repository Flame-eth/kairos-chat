/* eslint-disable react-hooks/refs */
"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { Message } from "@/types"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:8080"

interface UseSocketOptions {
  onMessage: (msg: Message) => void
  onTyping?: (sender: string, isTyping: boolean) => void
}

export function useSocket({ onMessage, onTyping }: UseSocketOptions) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const onMessageRef = useRef(onMessage)
  const onTypingRef = useRef(onTyping)
  onMessageRef.current = onMessage
  onTypingRef.current = onTyping

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

    socket.on("typing", ({ sender, isTyping }: { sender: string; isTyping: boolean }) => {
      onTypingRef.current?.(sender, isTyping)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const sendMessage = (sender: string, text: string) => {
    socketRef.current?.emit("sendMessage", { sender, text })
  }

  const sendTyping = (sender: string, isTyping: boolean) => {
    socketRef.current?.emit("typing", { sender, isTyping })
  }

  return { connected, error, sendMessage, sendTyping }
}
