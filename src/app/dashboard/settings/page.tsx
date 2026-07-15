'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Link2, Copy, Check, Loader2, UserPlus, Save, Settings } from 'lucide-react'

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
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
          <Settings className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-400">Manage your private space</p>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl p-3.5 text-sm border animate-slide-down ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <Heart className="w-4 h-4 text-neutral-400" />
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
          <CardTitle className="flex items-center gap-2.5 text-base">
            <Link2 className="w-4 h-4 text-neutral-400" />
            Connect with Partner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.partner_id ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-emerald-500" fill="currentColor" />
              </div>
              <p className="text-emerald-700 font-semibold text-lg">Connected!</p>
              <p className="text-sm text-emerald-600 mt-1">You can see each other&apos;s status and memories.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label>Your Pairing Code</Label>
                {profile?.pairing_code ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-neutral-50 text-center text-xl font-mono font-bold tracking-[0.25em] text-neutral-800 border border-neutral-200">
                      {profile.pairing_code}
                    </div>
                    <Button variant="ghost" size="icon" onClick={copyCode} className="shrink-0">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={generatePairingCode} className="w-full sm:w-auto">
                    Generate Code
                  </Button>
                )}
                <p className="text-xs text-neutral-400">
                  Share this code with your partner. They enter it below to connect.
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
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
