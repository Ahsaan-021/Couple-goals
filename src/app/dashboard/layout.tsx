'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Heart, ImageIcon, BarChart3, Settings, LogOut, Menu, X, Home, MessageCircle, MapPin, Flame } from 'lucide-react'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard/memories', label: 'Memories', icon: ImageIcon },
  { href: '/dashboard/streak', label: 'Streak', icon: Flame },
  { href: '/dashboard/location', label: 'Location', icon: MapPin },
  { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
          <Heart className="w-7 h-7 text-neutral-400" />
        </div>
        <p className="text-sm text-neutral-400">Loading your space...</p>
      </div>
    </div>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [partnerWhatsapp, setPartnerWhatsapp] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!profile?.partner_id) { setPartnerWhatsapp(null); return }
    supabase.from('profiles').select('whatsapp_number').eq('id', profile.partner_id).single().then(({ data }) => {
      if (data?.whatsapp_number) setPartnerWhatsapp(data.whatsapp_number)
      else setPartnerWhatsapp(null)
    })
  }, [profile?.partner_id])

  if (loading || !mounted) return <LoadingSkeleton />
  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-neutral-800 h-16">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-5 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" /> : <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 hidden sm:inline">Stay Connected</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {profile?.name || 'You'}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside className={`
          fixed lg:static inset-y-16 left-0 z-[999] w-60 bg-white dark:bg-neutral-950 border-r border-gray-100 dark:border-neutral-800 h-[calc(100vh-4rem)] lg:h-auto
          transform transition-all duration-300 ease-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0 shadow-elevated' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        `}>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.href === '/dashboard/chat' && unreadCount > 0 && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {pathname === item.href && item.href !== '/dashboard/chat' && (
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <DashboardContent>{children}</DashboardContent>
    </NotificationProvider>
  )
}
