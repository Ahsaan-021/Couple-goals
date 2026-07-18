'use client'

import Link from 'next/link'
import { Heart, FileText } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">Terms of Service</h1>
        </div>
        <p className="text-sm text-neutral-400 mb-8">Last updated: July 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Stay Connected (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We reserve the right to update these terms, and continued use after changes constitutes acceptance.</p>

          <h2>2. Description of Service</h2>
          <p>Stay Connected is a private platform for couples to share availability, emotions, memories, and location. The Service is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis with free and premium subscription tiers. It is a tool for existing couples, not a dating app or social network.</p>

          <h2>3. Eligibility</h2>
          <p>You must be at least 18 years old to use Stay Connected. By creating an account, you represent that you are 18 or older and that you are in a consensual relationship with your partner. You may not use the Service if you are prohibited by law.</p>

          <h2>4. User Responsibilities</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You agree not to misuse the platform for harassment, spam, impersonation, or illegal activity</li>
            <li>You must not share inappropriate, non-consensual, or abusive content</li>
            <li>You may not use the Service to monitor or track someone without their knowledge and consent</li>
            <li>You may not attempt to access another user&apos;s account or data</li>
            <li>You may not reverse-engineer, copy, or exploit the Service for competitive purposes</li>
          </ul>

          <h2>5. Account Creation & Security</h2>
          <p>You must provide accurate information when creating your account. You are responsible for all activity under your account. Notify us immediately at <a href="mailto:support@stayconnected.app" className="text-rose-500">support@stayconnected.app</a> if you suspect unauthorized access.</p>

          <h2>6. Subscription & Billing</h2>
          <p>Premium subscriptions are billed monthly or yearly as selected:</p>
          <ul>
            <li><strong>Free Tier:</strong> No payment required. Includes unlimited status check-ins, text chat, basic location sharing, current month insights, and up to 20 memories.</li>
            <li><strong>Premium Tier:</strong> ₹499/month or ₹399/month (yearly). Unlocks unlimited memories with albums, full mood history, anniversary reminders, streaks, shared calendar, and priority support.</li>
            <li>You can cancel anytime. Premium features remain active until the end of the current billing period.</li>
            <li>Refunds are handled on a case-by-case basis. Contact support within 14 days of payment for refund requests.</li>
            <li>Prices may change with 30 days notice via email.</li>
          </ul>

          <h2>7. Free Trial & Promotions</h2>
          <p>We may offer free trial periods for Premium. At the end of the trial, your account will revert to the Free tier unless you subscribe. Promotion codes and discounts are subject to specific terms stated at the time of offer.</p>

          <h2>8. Data & Privacy</h2>
          <p>Your privacy is important to us. All data is encrypted in transit and at rest. Messages are end-to-end encrypted. We do not sell your data. See our <Link href="/privacy" className="text-rose-500">Privacy Policy</Link> for complete details on how we handle your information.</p>

          <h2>9. Acceptable Use Policy</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Harass, abuse, or harm any user</li>
            <li>Share content that is illegal, abusive, or violates another person&apos;s rights</li>
            <li>Use automated tools (bots, scrapers) to access the Service</li>
            <li>Interfere with the Service&apos;s operation or security</li>
          </ul>
          <p>Violation may result in immediate account suspension or termination.</p>

          <h2>10. Account Termination</h2>
          <ul>
            <li><strong>By you:</strong> You can delete your account anytime by contacting support. All data is permanently removed within 30 days.</li>
            <li><strong>By us:</strong> We reserve the right to suspend or terminate accounts that violate these terms, with or without notice.</li>
            <li><strong>Upon disconnection:</strong> When partners disconnect, they no longer see each other&apos;s data. No data is shared with new partners after reconnection.</li>
          </ul>

          <h2>11. Limitation of Liability</h2>
          <p>Stay Connected is provided as a tool for private communication between couples. To the maximum extent permitted by law:</p>
          <ul>
            <li>We are not responsible for disputes between partners using the platform</li>
            <li>We are not liable for any indirect, incidental, or consequential damages</li>
            <li>Our total liability is limited to the amount you paid for the Service in the past 12 months</li>
            <li>The Service is provided &ldquo;as is&rdquo; without warranty of uninterrupted availability</li>
          </ul>

          <h2>12. Intellectual Property</h2>
          <p>Stay Connected&apos;s name, logo, design, and code are our intellectual property. You may not use them without permission. Your content (messages, photos, memories) remains your property. You grant us a limited license to store and transmit your content solely to provide the Service.</p>

          <h2>13. Third-Party Services</h2>
          <p>The Service uses third-party providers (Supabase, Vercel, Stripe) for infrastructure and payments. These providers have their own terms and privacy policies. We are not responsible for their operations.</p>

          <h2>14. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, India.</p>

          <h2>15. Changes to Terms</h2>
          <p>We may update these terms. Material changes will be communicated via email with 30 days notice. Continued use after changes takes effect constitutes acceptance. If you do not agree, you must stop using the Service.</p>

          <h2>16. Contact</h2>
          <p>For questions about these terms:</p>
          <ul>
            <li>Email: <a href="mailto:support@stayconnected.app" className="text-rose-500">support@stayconnected.app</a></li>
            <li>Support: <Link href="/contact" className="text-rose-500">Contact page</Link></li>
            <li>FAQ: <Link href="/faq" className="text-rose-500">Help Center</Link></li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}
