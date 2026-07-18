import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-gray-100 dark:border-neutral-800">
      <div className="grid sm:grid-cols-4 gap-8 mb-12 text-center sm:text-left">
        <div className="sm:col-span-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Stay Connected</span>
          </div>
          <p className="text-sm text-neutral-400">A platform to stay connected. End-to-end encrypted.</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Product</h4>
          <div className="space-y-2">
            <Link href="/pricing" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Pricing</Link>
            <Link href="/faq" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">FAQ</Link>
            <Link href="/contact" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Resources</h4>
          <div className="space-y-2">
            <Link href="/knowledge-base" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Help Center</Link>
            <Link href="/privacy" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Company</h4>
          <div className="space-y-2">
            <Link href="/contact" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Contact Us</Link>
            <a href="mailto:hello@stayconnected.app" className="block text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">hello@stayconnected.app</a>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-neutral-400">&copy; 2026 Stay Connected. All rights reserved.</p>
    </footer>
  )
}
