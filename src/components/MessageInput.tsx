"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizonal } from "lucide-react"

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 border-t bg-background p-4">
      <Input
        data-testid="message-input"
        placeholder={disabled ? "Connecting..." : "Type a message…"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        className="flex-1"
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
  )
}
