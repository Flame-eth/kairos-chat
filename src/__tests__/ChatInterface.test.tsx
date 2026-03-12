import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ChatInterface } from "@/components/ChatInterface"
import { Message } from "@/types"
import * as apiModule from "@/lib/api"

const mockSendMessage = vi.fn()
const mockSendTyping = vi.fn()
const mockLogout = vi.fn()
const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
}))

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ username: "Alice", logout: mockLogout }),
}))

vi.mock("@/hooks/useSocket", () => ({
  useSocket: ({
    onMessage,
    onTyping,
  }: {
    onMessage: (msg: Message) => void
    onTyping?: (sender: string, isTyping: boolean) => void
  }) => {
    ;(
      globalThis as unknown as {
        __onMessage: (msg: Message) => void
        __onTyping: (sender: string, isTyping: boolean) => void
      }
    ).__onMessage = onMessage
    ;(
      globalThis as unknown as {
        __onMessage: (msg: Message) => void
        __onTyping: (sender: string, isTyping: boolean) => void
      }
    ).__onTyping = (sender: string, isTyping: boolean) =>
      onTyping?.(sender, isTyping)
    return {
      connected: true,
      error: null,
      sendMessage: mockSendMessage,
      sendTyping: mockSendTyping,
    }
  },
}))

vi.mock("@/lib/api")

// Fresh QueryClient per test — avoids cross-test cache pollution
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const sampleMessages: Message[] = [
  { id: 1, sender: "Bob", text: "Hey Alice!", createdAt: "2024-01-01T10:00:00Z" },
  { id: 2, sender: "Alice", text: "Hi Bob!", createdAt: "2024-01-01T10:01:00Z" },
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
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument()
    })
  })

  it("loads and displays message history via TanStack Query", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Hey Alice!")).toBeInTheDocument()
      expect(screen.getByText("Hi Bob!")).toBeInTheDocument()
    })
    expect(apiModule.fetchMessages).toHaveBeenCalledWith(10, 0)
  })

  it("shows sender name for messages from others", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })

  it("send button triggers sendMessage with correct args", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => screen.getByTestId("message-input"))

    await userEvent.type(screen.getByTestId("message-input"), "Test message")
    await userEvent.click(screen.getByTestId("send-button"))

    expect(mockSendMessage).toHaveBeenCalledWith("Alice", "Test message")
  })

  it("clears input after sending", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => screen.getByTestId("message-input"))

    await userEvent.type(screen.getByTestId("message-input"), "Hello")
    await userEvent.click(screen.getByTestId("send-button"))

    expect(screen.getByTestId("message-input")).toHaveValue("")
  })

  it("send button is disabled when input is empty", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => screen.getByTestId("send-button"))
    expect(screen.getByTestId("send-button")).toBeDisabled()
  })

  it("appends incoming socket messages to the list", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
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
    act(() => { __onMessage(incomingMsg) })

    await waitFor(() => {
      expect(screen.getByText("New socket message!")).toBeInTheDocument()
    })
  })

  it("does not duplicate messages by id", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => screen.getByText("Hey Alice!"))

    const { __onMessage } = globalThis as unknown as {
      __onMessage: (msg: Message) => void
    }
    act(() => { __onMessage(sampleMessages[0]) })

    await waitFor(() => {
      expect(screen.getAllByText("Hey Alice!")).toHaveLength(1)
    })
  })

  it("shows typing indicator when another user is typing", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => screen.getByText("Hey Alice!"))

    const { __onTyping } = globalThis as unknown as {
      __onTyping: (sender: string, isTyping: boolean) => void
    }
    act(() => { __onTyping("Bob", true) })

    await waitFor(() => {
      expect(screen.getByTestId("typing-bubble")).toBeInTheDocument()
      expect(screen.getByLabelText("Bob is typing")).toBeInTheDocument()
    })
  })

  it("hides typing indicator when user stops typing", async () => {
    render(<ChatInterface />, { wrapper: createWrapper() })
    await waitFor(() => screen.getByText("Hey Alice!"))

    const { __onTyping } = globalThis as unknown as {
      __onTyping: (sender: string, isTyping: boolean) => void
    }
    act(() => { __onTyping("Bob", true) })
    await waitFor(() => screen.getByTestId("typing-bubble"))

    act(() => { __onTyping("Bob", false) })
    await waitFor(() => {
      expect(screen.queryByTestId("typing-bubble")).not.toBeInTheDocument()
    })
  })
})
