import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/context/UserContext"
import { Providers } from "@/components/Providers"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Kairos Chat",
  description: "Real-time 1-to-1 chat",
}

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body>
        <ThemeProvider>
          <Providers>
            <UserProvider>{children}</UserProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
