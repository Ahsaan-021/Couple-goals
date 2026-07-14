'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Link2, Copy, Check, Loader2, UserPlus, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [partnerCode, setPartnerCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [linking, setLinking] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile])

  const updateName = async () => {
    if (!user || !name.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ name: name.trim() }).eq('id', user.id)
    await refreshProfile()
    setMessage({ text: 'Name updated!', type: 'success' })
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const generatePairingCode = async () => {
    if (!user) return
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    await supabase.from('profiles').update({ pairing_code: code }).eq('id', user.id)
    await refreshProfile()
  }

  const connectPartner = async () => {
    if (!user || !partnerCode.trim()) return
    setLinking(true)
    setMessage(null)

    const { data, error } = await supabase.rpc('link_partner', {
      p_code: partnerCode.trim().toUpperCase(),
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setLinking(false)
      setTimeout(() => setMessage(null), 4000)
      return
    }

    if (data?.success) {
      await refreshProfile()
      setMessage({
        text: data.partner_name
          ? `Connected with ${data.partner_name}!`
          : 'Connected! You can now see each other\'s space.',
        type: 'success',
      })
      setPartnerCode('')
    } else {
      setMessage({ text: data?.error || 'Connection failed', type: 'error' })
    }

    setLinking(false)
    setTimeout(() => setMessage(null), 4000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(profile?.pairing_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-400">Manage your private space</p>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl p-3 text-sm border animate-slide-down ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-4 h-4 text-rose-400" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <div className="flex gap-2">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="flex-1 h-11" />
              <Button variant="secondary" size="sm" onClick={updateName} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4 text-rose-400" />
            Connect with Partner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.partner_id ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-green-700 font-semibold">Connected!</p>
              <p className="text-sm text-green-600 mt-1">You can see each other&apos;s status and memories.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label>Your Pairing Code</Label>
                {profile?.pairing_code ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-secondary text-center text-xl font-mono font-bold tracking-[0.25em] text-gray-800 border border-border/50">
                      {profile.pairing_code}
                    </div>
                    <Button variant="ghost" size="icon" onClick={copyCode} className="shrink-0">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={generatePairingCode} className="w-full sm:w-auto">
                    Generate Code
                  </Button>
                )}
                <p className="text-xs text-gray-400">
                  Share this code with your partner. They enter it below to connect.
                </p>
              </div>

              <div className="border-t border-border/30 pt-4 space-y-3">
                <Label>Enter Partner&apos;s Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                    className="font-mono tracking-wider uppercase flex-1 h-11"
                  />
                  <Button onClick={connectPartner} disabled={partnerCode.length < 6 || linking}>
                    {linking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-1" /> Connect</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
