import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ChatInterface } from "@/components/ChatInterface"
import { Message } from "@/types"
import * as apiModule from "@/lib/api"

const mockSendMessage = vi.fn()
const mockLogout = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
}))

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ username: "Alice", logout: mockLogout }),
}))

vi.mock("@/hooks/useSocket", () => ({
  useSocket: ({ onMessage }: { onMessage: (msg: Message) => void }) => {
    // Expose onMessage so tests can simulate incoming socket messages
    ;(
      globalThis as unknown as { __onMessage: (msg: Message) => void }
    ).__onMessage = onMessage
    return { connected: true, error: null, sendMessage: mockSendMessage }
  },
}))

vi.mock("@/lib/api")

const sampleMessages: Message[] = [
  {
    id: 1,
    sender: "Bob",
    text: "Hey Alice!",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    sender: "Alice",
    text: "Hi Bob!",
    createdAt: "2024-01-01T10:01:00Z",
  },
]

describe("ChatInterface", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiModule.fetchMessages).mockResolvedValue({
      data: sampleMessages,
      limit: 50,
      offset: 0,
    })
  })

  it("renders chat header with username", async () => {
    render(<ChatInterface />)
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument()
    })
  })

  it("loads and displays message history", async () => {
    render(<ChatInterface />)
    await waitFor(() => {
      expect(screen.getByText("Hey Alice!")).toBeInTheDocument()
      expect(screen.getByText("Hi Bob!")).toBeInTheDocument()
    })
  })

  it("shows sender name for messages from others", async () => {
    render(<ChatInterface />)
    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })

  it("send button triggers sendMessage with correct args", async () => {
    render(<ChatInterface />)
    await waitFor(() => screen.getByTestId("message-input"))

    const input = screen.getByTestId("message-input")
    await userEvent.type(input, "Test message")
    await userEvent.click(screen.getByTestId("send-button"))

    expect(mockSendMessage).toHaveBeenCalledWith("Alice", "Test message")
  })

  it("clears input after sending", async () => {
    render(<ChatInterface />)
    await waitFor(() => screen.getByTestId("message-input"))

    await userEvent.type(screen.getByTestId("message-input"), "Hello")
    await userEvent.click(screen.getByTestId("send-button"))

    expect(screen.getByTestId("message-input")).toHaveValue("")
  })

  it("send button is disabled when input is empty", async () => {
    render(<ChatInterface />)
    await waitFor(() => screen.getByTestId("send-button"))
    expect(screen.getByTestId("send-button")).toBeDisabled()
  })

  it("appends incoming socket messages to the list", async () => {
    render(<ChatInterface />)
    await waitFor(() => screen.getByText("Hey Alice!"))

    const incomingMsg: Message = {
      id: 99,
      sender: "Bob",
      text: "New socket message!",
      createdAt: new Date().toISOString(),
    }

    const { __onMessage } = globalThis as unknown as {
      __onMessage: (msg: Message) => void
    }
    act(() => {
      __onMessage(incomingMsg)
    })

    await waitFor(() => {
      expect(screen.getByText("New socket message!")).toBeInTheDocument()
    })
  })

  it("does not duplicate messages by id", async () => {
    render(<ChatInterface />)
    await waitFor(() => screen.getByText("Hey Alice!"))

    const { __onMessage } = globalThis as unknown as {
      __onMessage: (msg: Message) => void
    }
    act(() => {
      __onMessage(sampleMessages[0])
    }) // id=1, already in history

    await waitFor(() => {
      const matches = screen.getAllByText("Hey Alice!")
      expect(matches).toHaveLength(1)
    })
  })
})
