'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Heart, Clock, ImageIcon, BarChart3, Settings, LogOut, Menu, X, Home, MessageCircle } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard/memories', label: 'Memories', icon: ImageIcon },
  { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fdf2f0] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
          <Heart className="w-8 h-8 text-rose-400" />
        </div>
        <p className="text-sm text-gray-400">Loading your space...</p>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading || !mounted) return <LoadingSkeleton />
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fdf2f0]">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border/50 h-16">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-rose-50 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <span className="font-semibold text-gray-800 hidden sm:inline">Couple Goals</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-rose-50/50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {profile?.name || 'You'}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`
          fixed lg:static inset-y-16 left-0 z-30 w-60 bg-white/90 backdrop-blur-lg border-r border-border/50
          transform transition-all duration-300 ease-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        `}>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-rose-50 to-purple-50 text-rose-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {pathname === item.href && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
