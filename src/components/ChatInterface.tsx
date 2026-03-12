"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { useSocket } from "@/hooks/useSocket"
import { fetchMessages } from "@/lib/api"
import { MessageBubble } from "@/components/MessageBubble"
import { MessageInput } from "@/components/MessageInput"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { LogOut, MessageCircle } from "lucide-react"
import { Message } from "@/types"

const PAGE_SIZE = 50

export function ChatInterface() {
  const { username, logout } = useUser()
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    connected,
    error: socketError,
    sendMessage,
  } = useSocket({
    onMessage: (msg) => {
      setMessages((prev) => {
        // Deduplicate by id (in case REST and socket race)
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    },
  })

  // Initial history load
  useEffect(() => {
    if (!username) return
    fetchMessages(PAGE_SIZE, 0)
      .then(({ data }) => {
        setMessages(data)
        setOffset(data.length)
        setHasMore(data.length === PAGE_SIZE)
      })
      .catch(() => setLoadError("Failed to load messages"))
      .finally(() => setLoading(false))
  }, [username])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadOlderMessages = async () => {
    setLoadingMore(true)
    try {
      const { data } = await fetchMessages(PAGE_SIZE, offset)
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const fresh = data.filter((m) => !existingIds.has(m.id))
        return [...fresh, ...prev]
      })
      setOffset((o) => o + data.length)
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      // silently fail — not critical
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSend = (text: string) => {
    if (!username) return
    sendMessage(username, text)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex h-svh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold">Kairos Chat</span>
          <span className="text-sm text-muted-foreground">· {username}</span>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus connected={connected} error={socketError} />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Message area */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="flex min-h-full flex-col gap-3">
          {/* Load older messages */}
          {hasMore && !loading && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadOlderMessages}
                disabled={loadingMore}
                data-testid="load-more-button"
              >
                {loadingMore ? "Loading…" : "Load older messages"}
              </Button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div
              className="flex flex-col gap-3 pt-4"
              data-testid="loading-skeleton"
            >
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-48 animate-pulse rounded-2xl bg-muted ${i % 2 === 0 ? "self-start" : "self-end"}`}
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {loadError && (
            <p className="py-4 text-center text-sm text-destructive">
              {loadError}
            </p>
          )}

          {/* Messages */}
          {!loading && messages.length === 0 && !loadError && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender === username}
            />
          ))}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={!connected} />
    </div>
  )
}
