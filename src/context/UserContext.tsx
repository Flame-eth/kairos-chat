"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

interface UserContextType {
  username: string | null
  setUsername: (name: string) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("kairos_username")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setUsernameState(stored)
  }, [])

  const setUsername = (name: string) => {
    sessionStorage.setItem("kairos_username", name)
    setUsernameState(name)
  }

  const logout = () => {
    sessionStorage.removeItem("kairos_username")
    setUsernameState(null)
  }

  return (
    <UserContext.Provider value={{ username, setUsername, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
