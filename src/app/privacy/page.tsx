'use client'

import Link from 'next/link'
import { Heart, Shield } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="border-b border-gray-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="hidden sm:inline font-semibold text-neutral-900 dark:text-neutral-100">Stay Connected</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Privacy Policy</h1>
        </div>
        <p className="text-sm text-neutral-400 mb-8">Last updated: July 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Information We Collect</h2>
          <p>When you use Stay Connected, we collect the following categories of information:</p>
          <ul>
            <li><strong>Account information:</strong> Your name, email address, password (stored securely as a hash), and optional profile details (bio, gender, age, date of birth, avatar photo).</li>
            <li><strong>Content you share:</strong> Text messages, photos, videos, status updates, mood check-ins, memories, schedule entries, and location data that you explicitly choose to share with your partner.</li>
            <li><strong>Usage data:</strong> Aggregate, anonymized data about how you interact with the app (page views, feature usage, session duration) to improve our service. This does not include the content of your communications.</li>
            <li><strong>Device information:</strong> Browser type, operating system, and device type for compatibility and performance optimization.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>Your data is used exclusively to provide, maintain, and improve the Stay Connected service:</p>
          <ul>
            <li>To connect you with your partner and enable all sharing features</li>
            <li>To deliver notifications about partner updates (with your permission)</li>
            <li>To maintain and improve app performance and security</li>
            <li>To provide customer support and respond to your requests</li>
            <li>To send service-related emails (account confirmation, password reset, billing)</li>
          </ul>
          <p>We do not use your personal data for advertising, profiling, or any purpose not listed above.</p>

          <h2>3. Data Sharing & Third Parties</h2>
          <p>We do not sell, rent, or share your personal information with third parties for their own use. We use the following third-party services to operate the platform:</p>
          <ul>
            <li><strong>Supabase</strong> — Authentication, database, and file storage. Your data is stored on Supabase&apos;s encrypted infrastructure.</li>
            <li><strong>Vercel</strong> — Web hosting and deployment.</li>
            <li><strong>Stripe</strong> — Payment processing (Premium subscribers only). Stripe handles your payment information; we never store credit card details.</li>
          </ul>
          <p>Your shared content (messages, photos, location) is only visible to you and your connected partner. We use encrypted storage and transmission for all sensitive data.</p>

          <h2>4. End-to-End Encryption</h2>
          <p>All messages, media, and shared moments are encrypted in transit using TLS 1.3 and at rest using AES-256. Messages are designed so that only you and your partner can read them. We do not have access to the decryption keys for your private communications.</p>

          <h2>5. Location Data</h2>
          <p>Location sharing is entirely opt-in. You must explicitly enable it from the Location tab. When enabled:</p>
          <ul>
            <li>Your location is shared only with your connected partner</li>
            <li>We store only your most recent location update, not your location history</li>
            <li>You can stop sharing at any time with one tap</li>
            <li>Location data is deleted when you disconnect from your partner or delete your account</li>
          </ul>

          <h2>6. Chat Data</h2>
          <p>Chat messages are stored encrypted and are only accessible to you and your partner. Messages can be deleted individually. When you disconnect from a partner, messages become inaccessible to both parties. When you delete your account, all messages are permanently removed within 30 days.</p>

          <h2>7. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active. If you delete your account:</p>
          <ul>
            <li>All messages, memories, and shared content are permanently deleted within 30 days</li>
            <li>Your profile information is removed</li>
            <li>Your partner will be notified of the disconnection</li>
            <li>Anonymized usage statistics may be retained for analytical purposes</li>
          </ul>

          <h2>8. Your Rights</h2>
          <p>You have the following rights regarding your data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct your information anytime via Settings</li>
            <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
            <li><strong>Withdraw consent:</strong> Stop sharing location or revoke access permissions anytime</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:privacy@stayconnected.app" className="text-rose-500">privacy@stayconnected.app</a>.</p>

          <h2>9. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. You can disable cookies in your browser settings, but this may affect app functionality.</p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>Stay Connected is not intended for users under the age of 18. We do not knowingly collect information from minors. If we become aware that a user is under 18, we will delete their account and data promptly.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Material changes will be communicated via email. Continued use of the service after changes constitutes acceptance of the updated policy.</p>

          <h2>12. Contact</h2>
          <p>For privacy-related questions, data requests, or concerns:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@stayconnected.app" className="text-rose-500">privacy@stayconnected.app</a></li>
            <li>Support: <Link href="/contact" className="text-rose-500">Contact page</Link></li>
            <li>FAQ: <Link href="/faq" className="text-rose-500">Help Center</Link></li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}
