interface TypingBubbleProps {
  sender: string
}

export function TypingBubble({ sender }: TypingBubbleProps) {
  return (
    <div
      data-testid="typing-bubble"
      className="flex max-w-[75%] flex-col items-start gap-1 self-start"
      aria-label={`${sender} is typing`}
    >
      <span className="px-1 text-xs font-medium text-muted-foreground">
        {sender}
      </span>
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1.25">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
              style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
