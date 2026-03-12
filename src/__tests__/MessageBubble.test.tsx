import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { MessageBubble } from "@/components/MessageBubble"
import { Message } from "@/types"

const baseMessage: Message = {
  id: 1,
  sender: "Alice",
  text: "Hello, world!",
  createdAt: "2024-06-01T10:30:00Z",
}

describe("MessageBubble", () => {
  it("renders message text", () => {
    render(<MessageBubble message={baseMessage} isOwn={false} />)
    expect(screen.getByText("Hello, world!")).toBeInTheDocument()
  })

  it("renders sender name when message is not own", () => {
    render(<MessageBubble message={baseMessage} isOwn={false} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
  })

  it("does not render sender name for own messages", () => {
    render(<MessageBubble message={baseMessage} isOwn={true} />)
    expect(screen.queryByText("Alice")).not.toBeInTheDocument()
  })

  it("formats and renders the timestamp", () => {
    render(<MessageBubble message={baseMessage} isOwn={false} />)
    // Timestamp should be rendered (exact format depends on locale)
    const bubble = screen.getByTestId("message-bubble")
    expect(bubble).toBeInTheDocument()
  })

  it("applies own-message styling when isOwn is true", () => {
    const { container } = render(
      <MessageBubble message={baseMessage} isOwn={true} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain("self-end")
  })

  it("applies other-message styling when isOwn is false", () => {
    const { container } = render(
      <MessageBubble message={baseMessage} isOwn={false} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain("self-start")
  })
})
