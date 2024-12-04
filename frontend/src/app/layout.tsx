import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import Analytics from "./analytics"
import { CSPostHogProvider } from "./providers"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Json Lawgic",
  description: "Expressing laws as JsonLogic to enable legal reasoning and computation",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Analytics />
      <CSPostHogProvider>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
      </CSPostHogProvider>
    </html>
  )
}
