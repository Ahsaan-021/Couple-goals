'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Link2, Copy, Check, Loader2, UserPlus, Save, Settings, Shield, Camera, User, Trash2, AlertTriangle, X, Bell, MessageCircle, HelpCircle, BellRing } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [age, setAge] = useState(profile?.age?.toString() || '')
  const [dob, setDob] = useState(profile?.dob?.split('T')[0] || '')
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsapp_number || '')
  const [partnerCode, setPartnerCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [linking, setLinking] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [disconnectRequest, setDisconnectRequest] = useState<{ id: string; requester_name: string } | null>(null)
  const [pendingRequest, setPendingRequest] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { requestPushPermission, pushSupported, pushEnabled, togglePushEnabled } = useNotifications()

  useEffect(() => {
    if (profile?.name) setName(profile.name)
    if (profile?.bio) setBio(profile.bio)
    if (profile?.gender) setGender(profile.gender)
    if (profile?.age) setAge(profile.age.toString())
    if (profile?.dob) setDob(profile.dob?.split('T')[0] || '')
    if (profile?.whatsapp_number) setWhatsappNumber(profile.whatsapp_number)
  }, [profile])

  const handleDobChange = (value: string) => {
    setDob(value)
    if (value) {
      const birthDate = new Date(value + 'T00:00:00')
      const today = new Date()
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      setAge(calculatedAge > 0 ? calculatedAge.toString() : '')
    } else {
      setAge('')
    }
  }

  useEffect(() => {
    if (!profile?.partner_id || !user?.id) return
    supabase.from('profiles').select('name').eq('id', profile.partner_id).single().then(({ data }) => {
      if (data) setPartnerName(data.name)
    })
    supabase.from('disconnect_requests').select('id, requester_id').eq('requestee_id', user.id).eq('status', 'pending').maybeSingle().then(async ({ data }) => {
      if (data) {
        const { data: requester } = await supabase.from('profiles').select('name').eq('id', data.requester_id).single()
        setDisconnectRequest(requester ? { id: data.id, requester_name: requester.name } : null)
      }
    })
  }, [profile?.partner_id, user?.id])

  const updateProfile = async () => {
    if (!user) return
    setSaving(true)
    const updates: Record<string, any> = {}
    if (name.trim() !== profile?.name) updates.name = name.trim()
    if (bio !== (profile?.bio || '')) updates.bio = bio
    if (gender !== (profile?.gender || '')) updates.gender = gender || null
    if (age !== (profile?.age?.toString() || '')) updates.age = age ? parseInt(age) : null
    if (dob !== (profile?.dob?.split('T')[0] || '')) updates.dob = dob || null
    if (whatsappNumber !== (profile?.whatsapp_number || '')) updates.whatsapp_number = whatsappNumber || null
    if (Object.keys(updates).length === 0) { setSaving(false); return }
    await supabase.from('profiles').update(updates as any).eq('id', user.id)
    await refreshProfile()
    setMessage({ text: 'Profile updated!', type: 'success' })
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!data.url) { setMessage({ text: 'Upload failed', type: 'error' }); setUploading(false); return }
    await supabase.from('profiles').update({ avatar_url: data.url }).eq('id', user.id)
    await refreshProfile()
    setUploading(false)
    setMessage({ text: 'Avatar updated!', type: 'success' })
    setTimeout(() => setMessage(null), 3000)
  }

  const generatePairingCode = async () => {
    if (!user) return
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    await supabase.from('profiles').update({ pairing_code: code, pairing_code_created_by: user.id }).eq('id', user.id)
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

    const result = data as { success?: boolean; partner_name?: string; error?: string } | null

    if (result?.success) {
      await refreshProfile()
      setMessage({
        text: result.partner_name
          ? `Connected with ${result.partner_name}!`
          : 'Connected! You can now see each other\'s space.',
        type: 'success',
      })
      setPartnerCode('')
    } else {
      setMessage({ text: result?.error || 'Connection failed', type: 'error' })
    }

    setLinking(false)
    setTimeout(() => setMessage(null), 4000)
  }

  const requestDisconnect = async () => {
    if (!user) return
    setDisconnecting(true)
    const { data, error } = await supabase.rpc('request_disconnect')
    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setDisconnecting(false)
      return
    }
    const result = data as { success?: boolean; partner_name?: string; error?: string } | null
    if (result?.success) {
      setMessage({ text: `Disconnect request sent to ${result.partner_name}. Waiting for their approval.`, type: 'success' })
    }
    setShowDisconnectConfirm(false)
    setDisconnecting(false)
    setTimeout(() => setMessage(null), 5000)
  }

  const approveDisconnect = async () => {
    if (!user) return
    setDisconnecting(true)
    const { error } = await supabase.rpc('approve_disconnect')
    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setDisconnecting(false)
      return
    }
    await refreshProfile()
    setPartnerName(null)
    setDisconnectRequest(null)
    setMessage({ text: 'Disconnected successfully', type: 'success' })
    setDisconnecting(false)
    setTimeout(() => setMessage(null), 4000)
  }

  const rejectDisconnect = async () => {
    if (!user) return
    const { error } = await supabase.rpc('reject_disconnect')
    if (error) {
      setMessage({ text: error.message, type: 'error' })
      return
    }
    setDisconnectRequest(null)
    setMessage({ text: 'Disconnect request rejected', type: 'success' })
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
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
          <Settings className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Manage your profile and connections</p>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl p-3.5 text-sm border animate-slide-down flex items-center justify-between ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <User className="w-4 h-4 text-neutral-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-neutral-400" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-sm"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-neutral-900 dark:text-neutral-100">{profile?.name || 'You'}</p>
              <p className="text-xs text-neutral-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A little about you..."
              className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm outline-none focus:border-rose-200 focus:ring-1 focus:ring-rose-200 transition-all resize-none h-20"
              maxLength={200}
            />
            <p className="text-xs text-neutral-400 text-right">{bio.length}/200</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 text-sm outline-none focus:border-rose-200 focus:ring-1 focus:ring-rose-200 transition-all"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <div className="h-11 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 flex items-center text-sm text-neutral-700 dark:text-neutral-300">
                {age || '— Auto-calculated from DOB —'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => handleDobChange(e.target.value)} className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-sm border border-gray-200 dark:border-neutral-700">+92</span>
              <Input
                id="whatsapp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="3001234567"
                maxLength={10}
                className="h-11 flex-1"
              />
            </div>
            <p className="text-xs text-neutral-400">Your partner can message you directly on WhatsApp</p>
          </div>

          <Button onClick={updateProfile} disabled={saving} className="w-full h-11">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <Shield className="w-4 h-4 text-neutral-400" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 text-sm text-neutral-600 dark:text-neutral-400">
            <p className="font-medium text-neutral-800 dark:text-neutral-200 mb-1">End-to-end encrypted</p>
            <p>Your messages, media, and shared moments are encrypted end-to-end. Only you and your partner can read them.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              Help Center
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-medium">
              <MessageCircle className="w-3.5 h-3.5" />
              Contact Support
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <BellRing className="w-4 h-4 text-neutral-400" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pushSupported ? (
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Browser Notifications</p>
                  <p className="text-xs text-neutral-400">Get notified when your partner sends a message or updates their status</p>
                </div>
                <button
                  onClick={async () => {
                    if (pushEnabled) {
                      togglePushEnabled()
                    } else {
                      await requestPushPermission()
                    }
                  }}
                  className={`relative w-12 sm:w-14 h-7 rounded-full transition-colors shrink-0 ${pushEnabled ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white shadow-sm transition-transform flex items-center justify-center text-[8px] font-bold ${pushEnabled ? 'translate-x-[1.45rem] sm:translate-x-7 text-rose-500' : 'translate-x-0.5 text-neutral-400'}`}>
                    {pushEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Push notifications are not supported in your browser.</p>
            )}
            <div className="pt-2 text-xs text-neutral-400">
              <p>You will also see a badge on the Chat nav item for unviewed media messages.</p>
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
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-emerald-500" fill="currentColor" />
              </div>
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-lg">Connected!</p>
              {partnerName && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Connected with <strong>{partnerName}</strong></p>
              )}
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">You can see each other&apos;s status and memories.</p>

              {disconnectRequest ? (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{disconnectRequest.requester_name} wants to disconnect</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={rejectDisconnect} className="text-neutral-600">
                      Keep Connected
                    </Button>
                    <Button size="sm" onClick={approveDisconnect} disabled={disconnecting} className="bg-red-500 hover:bg-red-600">
                      {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Approve Disconnect
                    </Button>
                  </div>
                </div>
              ) : showDisconnectConfirm ? (
                <div className="mt-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">Send disconnect request to your partner. They must approve it.</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => setShowDisconnectConfirm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={requestDisconnect} disabled={disconnecting} className="bg-red-500 hover:bg-red-600">
                      {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />}
                      Send Request
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setShowDisconnectConfirm(true)} className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label>Your Pairing Code</Label>
                {profile?.pairing_code ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-center text-xl font-mono font-bold tracking-[0.25em] text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
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

              <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 space-y-3">
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
