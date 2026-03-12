"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react"
import { Button } from "@/components/ui/button"
import { SendHorizonal, Smile } from "lucide-react"

interface MessageInputProps {
  onSend: (text: string) => void
  onTypingChange?: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({ onSend, onTypingChange, disabled }: MessageInputProps) {
  const [value, setValue] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea as content grows/shrinks
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target as Node)
      ) {
        setShowEmoji(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Stop typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  const stopTyping = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTypingChange?.(false)
    }
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)

    if (!onTypingChange) return

    if (newValue.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true
        onTypingChange(true)
      }
      // Reset debounce: stop typing after 1.5s of idle
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(stopTyping, 1500)
    } else {
      stopTyping()
    }
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    stopTyping()
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setValue((prev) => prev + emojiData.emoji)
  }

  return (
    <div className="relative shrink-0 border-t bg-background">
      {/* Emoji picker popover */}
      {showEmoji && (
        <div
          ref={pickerRef}
          className="absolute bottom-full right-0 z-50 mb-1 mr-1"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            lazyLoadEmojis
            height={380}
            width={320}
          />
        </div>
      )}

      <div className="flex gap-2 p-4">
        {/* Emoji toggle */}
        <Button
          ref={emojiButtonRef}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowEmoji((prev) => !prev)}
          disabled={disabled}
          aria-label="Toggle emoji picker"
          data-testid="emoji-button"
        >
          <Smile className="h-4 w-4" />
        </Button>

        <textarea
          ref={textareaRef}
          data-testid="message-input"
          placeholder={disabled ? "Connecting..." : "Type a message…"}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          rows={1}
          className="flex-1 resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-13 max-h-30"
        />

        <Button
          data-testid="send-button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
