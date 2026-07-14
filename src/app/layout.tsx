import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Couple Goals',
  description: 'A private relationship support and memory platform for couples',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fdf2f0]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
