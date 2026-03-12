import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  connected: boolean
  error: string | null
}

export function ConnectionStatus({ connected, error }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs" aria-live="polite">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connected ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className="text-muted-foreground">
        {error ?? (connected ? "Connected" : "Disconnected")}
      </span>
    </div>
  )
}
