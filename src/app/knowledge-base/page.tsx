'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, BookOpen, Search, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'

interface KBEntry {
  id: string
  title: string
  description: string
  section: string
  content: string
  updated: string
  related?: string[]
}

const entries: KBEntry[] = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    description: 'Learn how to create your account, sign in, and set up your private space.',
    section: 'Basics',
    content: `Creating an Account:
1. Go to the homepage and click "Get Started"
2. Enter your name, email, and a password (minimum 6 characters)
3. Check your email for a confirmation link and click it
4. Sign in with your email and password

Your private space is now ready! The next step is to connect with your partner.`,
    updated: 'July 2026',
    related: ['connecting-partner', 'profile-setup'],
  },
  {
    id: 'connecting-partner',
    title: 'Connecting with Your Partner',
    description: 'How to generate a pairing code and link accounts with your partner.',
    section: 'Basics',
    content: `Connecting with Your Partner:
1. Go to Settings → Connect with Partner
2. Tap "Generate Code" to create a 6-character code
3. Share this code with your partner (via WhatsApp, SMS, etc.)
4. Your partner goes to their Settings → Connect with Partner
5. They enter your code in "Enter Partner's Code" and tap "Connect"
6. Both accounts are now linked!

Note: Each code can only be used once. If the code expires or is used, generate a new one.`,
    updated: 'July 2026',
    related: ['getting-started', 'disconnecting'],
  },
  {
    id: 'profile-setup',
    title: 'Profile Setup (Avatar, Bio, DOB)',
    description: 'How to customize your profile with photo, bio, gender, and date of birth.',
    section: 'Basics',
    content: `Setting Up Your Profile:
1. Go to Settings → Profile
2. Tap the camera icon on your avatar to upload a profile photo
3. Enter your name, bio, gender, and date of birth
4. Your age will auto-calculate from the date of birth
5. Add your WhatsApp number so your partner can message you directly
6. Tap "Save Profile" to save all changes

Your partner can see your profile information.`,
    updated: 'July 2026',
    related: ['getting-started', 'whatsapp-chat'],
  },
  {
    id: 'status-mood',
    title: 'Status & Mood Updates',
    description: 'How to update your status and mood so your partner knows how you\'re doing.',
    section: 'Features',
    content: `Updating Your Status & Mood:
1. On the Home dashboard, you'll see the status selector
2. Tap a reason: Working, Studying, Busy, Free, Sleeping, Gym, etc.
3. Tap a mood: Loving, Happy, Stressed, Sad, Energetic, Tired, etc.
4. Optionally add a custom note
5. Your partner will see your status immediately

Your partner can also see your emotional trends in the Insights page.`,
    updated: 'July 2026',
    related: ['insights', 'notifications'],
  },
  {
    id: 'chat',
    title: 'Private Chat',
    description: 'How to send messages, photos, videos, and one-time view messages.',
    section: 'Features',
    content: `Using the Chat:
1. Go to the Chat tab from the sidebar
2. Type your message in the input box and press Enter or tap Send
3. To send a photo/video: tap the media icon (image/video) in the input bar
4. To take a photo: tap the camera button to use your device camera
5. One-time view messages: send a photo that self-destructs after viewing
6. All messages are end-to-end encrypted

Deleting Messages:
- You can delete your own messages
- The person who created the pairing code can delete any message
- Deleted messages are removed for both partners`,
    updated: 'July 2026',
    related: ['getting-started', 'encryption'],
  },
  {
    id: 'schedule',
    title: 'Daily Schedule',
    description: 'How to set your daily availability so your partner knows when you\'re free.',
    section: 'Features',
    content: `Using the Schedule:
1. On the Home dashboard, you'll see the Schedule section
2. Each day has time slots that you can tap to toggle on/off
3. After making changes, tap the green check icon to save
4. Your partner can see your weekly schedule to know when you're free

Green = Available, Gray = Busy. Save manually after each change.`,
    updated: 'July 2026',
    related: ['status-mood'],
  },
  {
    id: 'memories',
    title: 'Shared Memories',
    description: 'How to add photos and moments to your shared timeline.',
    section: 'Features',
    content: `Adding Memories:
1. Go to the Memories tab
2. Tap "Add Memory" to create a new memory
3. Choose a photo and add a caption
4. The memory appears in your shared timeline
5. Switch between Timeline view and Gallery view
6. Premium users can organize memories into albums

Free tier: up to 20 memories
Premium: unlimited memories with albums and search`,
    updated: 'July 2026',
    related: ['pricing', 'connecting-partner'],
  },
  {
    id: 'location-sharing',
    title: 'Location Sharing',
    description: 'How to share your live location with your partner on a real map.',
    section: 'Features',
    content: `Sharing Your Location:
1. Go to the Location tab
2. Tap "Share My Location" to enable sharing
3. Your partner will see your location as a red pin on the map
4. They appear as a green pin
5. The map shows the distance between you
6. Tap "Stop Sharing" to turn off location sharing at any time

Privacy: Location sharing is opt-in. Only your current location is stored, not your history. Data is deleted when you disconnect.`,
    updated: 'July 2026',
    related: ['privacy', 'disconnecting'],
  },
  {
    id: 'insights',
    title: 'Monthly Insights',
    description: 'How to view your relationship patterns, mood trends, and birthday countdowns.',
    section: 'Features',
    content: `Viewing Insights:
1. Go to the Insights tab
2. See your mood and status breakdown for the current month
3. Navigate between months (from your earliest memory to current)
4. Birthday countdown appears during your partner's birth month
5. Insights helps you understand your emotional patterns

Free tier: current month only
Premium: full history with trends and patterns`,
    updated: 'July 2026',
    related: ['status-mood', 'pricing'],
  },
  {
    id: 'notifications',
    title: 'Notifications & Alerts',
    description: 'How notifications work - browser alerts, in-app badges, and what triggers them.',
    section: 'Features',
    content: `Types of Notifications:
1. Browser Notifications: Get alerted when your partner sends a message or updates their status (enable in Settings → Notifications)
2. In-App Bell Icon: The bell icon in the header shows a badge count
3. Chat Badge: Unviewed media messages show a badge on the Chat nav item
4. Partner Status: Get notified when your partner changes their mood or status

Enable browser notifications in Settings → Notifications for real-time alerts even when the tab is in the background.`,
    updated: 'July 2026',
    related: ['status-mood', 'chat', 'settings'],
  },
  {
    id: 'whatsapp-chat',
    title: 'WhatsApp Integration',
    description: 'How to connect WhatsApp for direct messaging with your partner.',
    section: 'Features',
    content: `Using WhatsApp:
1. Go to Settings → Profile
2. Enter your WhatsApp number (Pakistan format: 3XXXXXXXXX)
3. The WhatsApp icon in the dashboard header will now be active
4. Click the WhatsApp icon to open a chat with your partner
5. On mobile: opens the WhatsApp app directly
6. On desktop: opens WhatsApp Web

Your partner needs to have your number saved in their contacts for messages to work.`,
    updated: 'July 2026',
    related: ['profile-setup', 'chat'],
  },
  {
    id: 'disconnecting',
    title: 'Disconnecting from Your Partner',
    description: 'How the two-step disconnect process works.',
    section: 'Account',
    content: `Disconnecting:
1. Go to Settings → Connect with Partner
2. Tap "Disconnect"
3. This sends a disconnect request to your partner
4. Your partner will see the request on their Settings page
5. They can choose "Approve" or "Reject"
6. If approved, both accounts are disconnected
7. You can connect with a new partner later

What happens to your data?
- You will no longer see each other's status, location, or chat
- Your data is not deleted but becomes inaccessible to your former partner
- To permanently delete your data, delete your account`,
    updated: 'July 2026',
    related: ['connecting-partner', 'privacy', 'contact'],
  },
  {
    id: 'encryption',
    title: 'Privacy & Encryption',
    description: 'How your data is protected end-to-end.',
    section: 'Account',
    content: `Data Protection:
1. All messages are encrypted end-to-end (E2EE)
2. Only you and your partner can read your messages
3. We cannot access your private conversations
4. Your location is only shared with your partner when you enable it
5. We do not sell your data to anyone
6. Your data is stored encrypted on Supabase infrastructure

For full details, see our Privacy Policy and Terms of Service.`,
    updated: 'July 2026',
    related: ['privacy', 'terms'],
  },
  {
    id: 'pricing',
    title: 'Pricing & Plans',
    description: 'Free vs Premium comparison and what you get with each plan.',
    section: 'Account',
    content: `Current Plans:
Free Tier (PKR 0):
- Unlimited status & mood check-ins
- Text chat with your partner
- Basic location sharing (pin)
- Up to 20 memories
- Current month insights only

Premium Tier (PKR 2,000/month):
- Everything in Free
- Chat with photos & videos
- Live location with real map
- Unlimited memories with albums & search
- Full mood history & trends
- Anniversary & date reminders
- Daily connection streaks
- Shared calendar view
- Priority support

Yearly: PKR 1,600/month (billed PKR 19,200/year — save 20%)`,
    updated: 'July 2026',
    related: ['memories', 'insights', 'contact'],
  },
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    description: 'How to switch between light and dark themes.',
    section: 'Settings',
    content: `Using Dark Mode:
1. Click the moon/sun icon in the header or navigation bar
2. Toggles between light mode and dark mode
3. Your preference is saved automatically
4. Follows your system preference by default
5. Works on all pages including login, dashboard, settings, and public pages`,
    updated: 'July 2026',
    related: ['settings'],
  },
  {
    id: 'contact',
    title: 'Contact & Support',
    description: 'How to reach us for help, feedback, or support.',
    section: 'Settings',
    content: `Getting Help:
1. Visit the Help Center (/faq) for common questions
2. Use the Contact page (/contact) to send us a message
3. Email us directly at support@stayconnected.app
4. For privacy concerns: privacy@stayconnected.app

We aim to respond within 24 hours.`,
    updated: 'July 2026',
    related: ['getting-started', 'disconnecting'],
  },
]

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(null)

  const filtered = entries.filter(e =>
    !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sections = Array.from(new Set(filtered.map(e => e.section)))

  if (selectedEntry) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <header className="border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button onClick={() => setSelectedEntry(null)} className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
              ← Back to Knowledge Base
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-3xl mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
              <span>{selectedEntry.section}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-neutral-600 dark:text-neutral-300">{selectedEntry.title}</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{selectedEntry.title}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mb-2">{selectedEntry.description}</p>
            <p className="text-xs text-neutral-400 mb-8">Last updated: {selectedEntry.updated}</p>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-6 md:p-8 shadow-card">
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {selectedEntry.content.split('\n').map((line, i) => {
                  if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                    return <h3 key={i} className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3">{line.replace(/\*\*/g, '')}</h3>
                  }
                  if (line.trim().startsWith('- ')) {
                    return <li key={i} className="text-neutral-600 dark:text-neutral-400 ml-4">{line.trim().substring(2)}</li>
                  }
                  if (/^\d+\./.test(line.trim())) {
                    return <li key={i} className="text-neutral-600 dark:text-neutral-400 ml-4">{line.trim()}</li>
                  }
                  if (line.trim() === '') return <br key={i} />
                  return <p key={i} className="text-neutral-600 dark:text-neutral-400">{line}</p>
                })}
              </div>
            </div>
            {selectedEntry.related && selectedEntry.related.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Related Articles</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.related.map(id => {
                    const related = entries.find(e => e.id === id)
                    if (!related) return null
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedEntry(related)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {related.title}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

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

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Knowledge Base</h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            Your complete guide to using Stay Connected. Search for topics or browse by section.
          </p>
        </div>

        <div className="relative mb-12 max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search the knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-none focus:border-rose-300 dark:focus:border-rose-700 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">No results found for &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map(section => (
              <div key={section}>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 px-1">{section}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {filtered.filter(e => e.section === section).map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="text-left bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 hover:border-rose-200 dark:hover:border-rose-800 hover:shadow-sm transition-all group"
                    >
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 transition-colors">{entry.title}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{entry.description}</p>
                      <p className="text-xs text-neutral-400 mt-2">Updated {entry.updated}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16 p-8 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-neutral-900 rounded-3xl border border-rose-100 dark:border-rose-900/30">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Still need help?</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Contact our support team.</p>
          <Link href="/contact"><Button>Contact Support</Button></Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
