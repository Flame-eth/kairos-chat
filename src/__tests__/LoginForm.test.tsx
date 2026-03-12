import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { LoginForm } from "@/components/LoginForm"

const mockPush = vi.fn()
const mockSetUsername = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}))

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({
    username: null,
    setUsername: mockSetUsername,
    logout: vi.fn(),
  }),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the username input and submit button", () => {
    render(<LoginForm />)
    expect(screen.getByTestId("username-input")).toBeInTheDocument()
    expect(screen.getByTestId("login-submit")).toBeInTheDocument()
  })

  it("shows error when submitting with empty username", async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByTestId("login-submit"))
    expect(screen.getByText(/Please enter a username/i)).toBeInTheDocument()
  })

  it("shows error when username is too short", async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByTestId("username-input"), "A")
    await userEvent.click(screen.getByTestId("login-submit"))
    expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument()
  })

  it("calls setUsername and navigates to /chat on valid submit", async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByTestId("username-input"), "Alice")
    await userEvent.click(screen.getByTestId("login-submit"))
    expect(mockSetUsername).toHaveBeenCalledWith("Alice")
    expect(mockPush).toHaveBeenCalledWith("/chat")
  })

  it("trims whitespace from username before submitting", async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByTestId("username-input"), "  Bob  ")
    await userEvent.click(screen.getByTestId("login-submit"))
    expect(mockSetUsername).toHaveBeenCalledWith("Bob")
  })

  it("quick-join buttons pre-fill username", async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByText("User A"))
    expect(screen.getByTestId("username-input")).toHaveValue("User A")
  })

  it("clears error when user starts typing", async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByTestId("login-submit"))
    expect(screen.getByText(/Please enter a username/i)).toBeInTheDocument()
    await userEvent.type(screen.getByTestId("username-input"), "A")
    expect(
      screen.queryByText(/Please enter a username/i)
    ).not.toBeInTheDocument()
  })
})
