import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'R-GRAM API',
  description: 'R-GRAM Social Media API Server',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

