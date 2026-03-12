import { Message } from "@/types"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      data-testid="message-bubble"
      className={cn(
        "flex max-w-[75%] flex-col gap-1",
        isOwn ? "items-end self-end" : "items-start self-start"
      )}
    >
      {!isOwn && (
        <span className="px-1 text-xs font-medium text-muted-foreground">
          {message.sender}
        </span>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-2 text-sm wrap-break-word",
          isOwn
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground"
        )}
      >
        {message.text}
      </div>
      <span className="px-1 text-xs text-muted-foreground">
        {formatTime(message.createdAt)}
      </span>
    </div>
  )
}
