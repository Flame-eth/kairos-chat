"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export function LoginForm() {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const { setUsername } = useUser()
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError("Please enter a username")
      return
    }
    if (trimmed.length < 2) {
      setError("Username must be at least 2 characters")
      return
    }
    setUsername(trimmed)
    router.push("/chat")
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MessageCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Kairos Chat</CardTitle>
          <CardDescription>
            Enter your username to start chatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                data-testid="username-input"
                placeholder="Your username"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError("")
                }}
                autoFocus
                autoComplete="off"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" data-testid="login-submit">
              Start Chatting
            </Button>
            <div className="space-y-1 text-center text-sm text-muted-foreground">
              <p className="font-medium">Quick join</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setValue("User A")}
                >
                  User A
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setValue("User B")}
                >
                  User B
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
