"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { useSocket } from "@/hooks/useSocket"
import { fetchMessages } from "@/lib/api"
import { MessageBubble } from "@/components/MessageBubble"
import { MessageInput } from "@/components/MessageInput"
import { ConnectionStatus } from "@/components/ConnectionStatus"
import { TypingBubble } from "@/components/TypingBubble"
import { Button } from "@/components/ui/button"
import { LogOut, MessageCircle, ArrowDown } from "lucide-react"
import { Message } from "@/types"

const PAGE_SIZE = 10

export function ChatInterface() {
  const { username, logout } = useUser()
  const router = useRouter()

  const [socketMessages, setSocketMessages] = useState<Message[]>([])
  const [olderMessages, setOlderMessages] = useState<Message[]>([])
  const [nextOffset, setNextOffset] = useState(PAGE_SIZE)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const {
    connected,
    error: socketError,
    sendMessage,
    sendTyping,
  } = useSocket({
    onMessage: (msg) => {
      setSocketMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    },
    onTyping: (sender, isTyping) => {
      setTypingUsers((prev) =>
        isTyping
          ? [...new Set([...prev, sender])]
          : prev.filter((s) => s !== sender)
      )
    },
  })

  const {
    data: initialData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["messages", { limit: PAGE_SIZE, offset: 0 }],
    queryFn: () => fetchMessages(PAGE_SIZE, 0),
    staleTime: Infinity,
    enabled: !!username,
  })

  const allMessages = useMemo(() => {
    const historic = [...olderMessages, ...(initialData?.data ?? [])]
    const historicIds = new Set(historic.map((m) => m.id))
    return [
      ...historic,
      ...socketMessages.filter((m) => !historicIds.has(m.id)),
    ]
  }, [olderMessages, initialData, socketMessages])

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    isAtBottomRef.current = atBottom
    setShowScrollButton(!atBottom)
  }

  // Scroll to bottom instantly when initial history loads
  useEffect(() => {
    if (initialData) scrollToBottom("instant")
  }, [initialData])

  // Auto-scroll on new socket messages:
  useEffect(() => {
    if (socketMessages.length === 0) return

    requestAnimationFrame(() => scrollToBottom())
  }, [socketMessages, username])

  // Auto-scroll typing bubbles if already at the bottom
  useEffect(() => {
    if (typingUsers.length > 0 && isAtBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom())
    }
  }, [typingUsers])

  const loadOlderMessages = async () => {
    setLoadingMore(true)
    try {
      const { data } = await fetchMessages(PAGE_SIZE, nextOffset)
      setOlderMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const fresh = data.filter((m) => !existingIds.has(m.id))
        return [...fresh, ...prev]
      })
      setNextOffset((o) => o + data.length)
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      // silently fail — not critical path
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSend = (text: string) => {
    if (!username) return
    sendMessage(username, text)
  }

  const handleTypingChange = (isTyping: boolean) => {
    if (!username) return
    sendTyping(username, isTyping)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="relative flex h-svh flex-col overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3">
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
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-2"
      >
        <div className="flex min-h-full flex-col gap-3">
          {/* Load older messages */}
          {hasMore && !isLoading && (
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
          {isLoading && (
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
          {isError && (
            <p className="py-4 text-center text-sm text-destructive">
              Failed to load messages. Please refresh.
            </p>
          )}

          {/* Empty state */}
          {!isLoading && allMessages.length === 0 && !isError && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages yet. Say hello!
            </p>
          )}

          {/* Messages */}
          {allMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender === username}
            />
          ))}

          {/* Typing bubbles */}
          {typingUsers.map((sender) => (
            <TypingBubble key={sender} sender={sender} />
          ))}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-md"
            onClick={() => scrollToBottom()}
            aria-label="Scroll to bottom"
            data-testid="scroll-to-bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTypingChange={handleTypingChange}
        disabled={!connected}
      />
    </div>
  )
}
