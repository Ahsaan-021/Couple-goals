'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ChevronDown, ChevronUp, MessageCircle, MapPin, ImageIcon, Bell, Link2, Shield, Search, CreditCard, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'

const faqs = [
  {
    category: 'Getting Started',
    icon: Link2,
    items: [
      { q: 'How do I connect with my partner?', a: 'Go to Settings and tap "Generate Code". Share this 6-character code with your partner. They enter it in their Settings under "Enter Partner\'s Code" and you\'re connected instantly. Both accounts are then linked permanently unless a disconnect is requested and approved.' },
      { q: 'What if my partner doesn\'t have the app yet?', a: 'Share the sign-up link with them. Once they create an account, they can use your unique pairing code from Settings to connect. Each code can only be used once.' },
      { q: 'Can either person generate the pairing code?', a: 'Yes, either person can generate a code. Once a code is used to connect, both accounts are linked. The person who generated the code can manage chat message deletion privileges.' },
      { q: 'How do I sign up?', a: 'Click "Get Started" on the homepage, enter your name, email, and a password (minimum 6 characters). You\'ll receive a confirmation email — click the link to verify your account, then sign in.' },
    ],
  },
  {
    category: 'Features',
    icon: MessageCircle,
    items: [
      { q: 'How do status updates and moods work?', a: 'On your Home screen, tap a reason (Working, Studying, Busy, etc.) and a mood (Loving, Happy, Stressed, etc.) to let your partner know how you\'re doing. You can also add a short custom note. Your partner sees your status immediately on their dashboard.' },
      { q: 'How does chat work?', a: 'The Chat tab lets you send text messages, photos, and videos to your partner. You can also take a photo directly with the camera button. One-time view messages self-destruct after your partner views them. All messages are end-to-end encrypted.' },
      { q: 'How does location sharing work?', a: 'Go to the Location tab and tap "Share My Location". Your partner will see your live coordinates on a map. You can stop sharing at any time. Location updates are battery-efficient and only shared with your connected partner.' },
      { q: 'What are Memories?', a: 'Memories is a shared timeline of photos, videos, and text moments that you and your partner can add to. Each memory can have a caption. You can view them as a timeline or a gallery. Premium users can create albums and search.' },
      { q: 'What are Insights?', a: 'Insights shows you monthly patterns of your mood check-ins. See how many times each mood and status was used. It also shows a birthday countdown during your partner\'s birth month. Navigation goes from your earliest memory to current month.' },
      { q: 'How do I set my schedule?', a: 'The Schedule manager on your dashboard lets you set your daily availability. Tap any time slot to toggle it on/off, then click the check icon to save your changes. Your partner can see your schedule to know when you\'re free.' },
    ],
  },
  {
    category: 'Privacy & Security',
    icon: Shield,
    items: [
      { q: 'Is my data encrypted?', a: 'Yes. All messages, media, and shared moments are encrypted end-to-end. Only you and your partner can read them — not even we have access. Your data is encrypted both in transit and at rest.' },
      { q: 'Who can see my location?', a: 'Only your connected partner. Location sharing is opt-in — you must explicitly enable it from the Location tab. You can stop sharing at any time, and we only store your most recent location, not your history.' },
      { q: 'Do you sell my data?', a: 'No. We do not sell, rent, or share your personal information with third parties. Your data belongs to you. See our Privacy Policy for full details.' },
      { q: 'Can I delete my account or data?', a: 'Yes. You can request account deletion by contacting us. All your data, including messages, memories, and profile information, will be permanently removed within 30 days.' },
      { q: 'Is this app a dating app?', a: 'No. Stay Connected is specifically designed for existing couples who want a private space to share their lives. It is not a dating app, not for finding partners, and not a social network. There are no public profiles, feeds, likes, or comments.' },
    ],
  },
  {
    category: 'Subscription & Billing',
    icon: CreditCard,
    items: [
      { q: 'Is there a free plan?', a: 'Yes! The Free plan includes unlimited status check-ins and mood updates, text chat with your partner, basic location sharing, and Insights for the current month. Memories are limited to 20 items.' },
      { q: 'What do I get with Premium?', a: 'Premium at ₹499/month unlocks unlimited memories with albums and search, full mood history and trends going back months, anniversary and date reminders, daily connection streaks, a shared calendar view, and priority support.' },
      { q: 'Can I switch between plans?', a: 'Yes. You can upgrade from Free to Premium at any time. If you downgrade, your Premium features remain active until the end of your billing period, then you revert to Free limits.' },
      { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from Settings or by contacting support. Your Premium features will remain active until the end of the billing period. There are no cancellation fees.' },
      { q: 'What happens if I disconnect from my partner?', a: 'When you disconnect, you will no longer see each other\'s status, location, or chat messages. Your data (memories, messages) is not deleted but becomes inaccessible to your former partner. You can connect with a new partner later.' },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: Bell,
    items: [
      { q: 'Why am I not receiving email confirmations?', a: 'Check your spam folder. Make sure you entered the correct email address. If you still don\'t receive it, contact support and we\'ll help.' },
      { q: 'Why can\'t I connect with my partner?', a: 'Make sure the pairing code is exactly 6 characters and entered correctly (it\'s case-sensitive). The code must have been generated recently and not already used. Each code can only be used once.' },
      { q: 'Why is my location not updating?', a: 'Make sure location services are enabled on your device. Try tapping "Share My Location" again. If using a browser, ensure location permissions are granted.' },
      { q: 'How do I report a problem?', a: 'You can contact us through the Contact page or email support@stayconnected.app. We aim to respond within 24 hours.' },
    ],
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<{ category: number; item: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="hidden sm:inline font-semibold text-neutral-900 dark:text-neutral-100">Stay Connected</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <Link href="/auth/login"><Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Sign In</Button></Link>
            <Link href="/auth/register"><Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Help Center</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400">Find answers to common questions about Stay Connected</p>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-300 dark:focus:border-rose-700 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all"
          />
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No results found for &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredFaqs.map((category, ci) => (
              <div key={ci}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                    <category.icon className="w-4 h-4 text-rose-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{category.category}</h2>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, ii) => {
                    const isOpen = openIndex?.category === ci && openIndex?.item === ii
                    return (
                      <div key={ii} className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden transition-shadow hover:shadow-sm">
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : { category: ci, item: ii })}
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 pr-4">{item.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 animate-slide-down">
                            <div className="w-full h-px bg-gray-100 dark:bg-neutral-800 mb-3" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16 p-8 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-neutral-900 rounded-3xl border border-rose-100 dark:border-rose-900/30">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Still have questions?</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">We&apos;re here to help you.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
