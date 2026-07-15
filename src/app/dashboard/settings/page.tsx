'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Link2, Copy, Check, Loader2, UserPlus, Save, Settings, Shield, Camera, User, Trash2, AlertTriangle, X } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [age, setAge] = useState(profile?.age?.toString() || '')
  const [dob, setDob] = useState(profile?.dob?.split('T')[0] || '')
  const [partnerCode, setPartnerCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [linking, setLinking] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile?.name) setName(profile.name)
    if (profile?.bio) setBio(profile.bio)
    if (profile?.gender) setGender(profile.gender)
    if (profile?.age) setAge(profile.age.toString())
    if (profile?.dob) setDob(profile.dob.split('T')[0])
  }, [profile])

  useEffect(() => {
    if (profile?.partner_id) {
      supabase.from('profiles').select('name').eq('id', profile.partner_id).single().then(({ data }) => {
        if (data) setPartnerName(data.name)
      })
    }
  }, [profile?.partner_id])

  const updateProfile = async () => {
    if (!user) return
    setSaving(true)
    const updates: Record<string, any> = {}
    if (name.trim() !== profile?.name) updates.name = name.trim()
    if (bio !== (profile?.bio || '')) updates.bio = bio
    if (gender !== (profile?.gender || '')) updates.gender = gender || null
    if (age !== (profile?.age?.toString() || '')) updates.age = age ? parseInt(age) : null
    if (dob !== (profile?.dob?.split('T')[0] || '')) updates.dob = dob || null
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
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { setMessage({ text: uploadError.message, type: 'error' }); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
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

  const disconnectPartner = async () => {
    if (!user) return
    setDisconnecting(true)
    const { data, error } = await supabase.rpc('disconnect_partner')
    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setDisconnecting(false)
      return
    }
    const result = data as { success?: boolean; partner_name?: string; error?: string } | null
    if (result?.success) {
      await refreshProfile()
      setPartnerName(null)
      setMessage({ text: result.partner_name ? `Disconnected from ${result.partner_name}` : 'Disconnected', type: 'success' })
    }
    setShowDisconnectConfirm(false)
    setDisconnecting(false)
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
          <p className="text-sm text-neutral-400">Manage your profile and connections</p>
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
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
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
              <p className="font-medium text-neutral-900">{profile?.name || 'You'}</p>
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
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-200 focus:ring-1 focus:ring-rose-200 transition-all resize-none h-20"
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
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-rose-200 focus:ring-1 focus:ring-rose-200 transition-all"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={1} max={150} value={age} onChange={(e) => setAge(e.target.value)} className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-11" />
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
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-sm text-neutral-600">
            <p className="font-medium text-neutral-800 mb-1">End-to-end encrypted</p>
            <p>Your messages, media, and shared moments are encrypted end-to-end. Only you and your partner can read them.</p>
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
              {partnerName && (
                <p className="text-sm text-emerald-600 mt-1">Connected with <strong>{partnerName}</strong></p>
              )}
              <p className="text-sm text-emerald-600 mt-1">You can see each other&apos;s status and memories.</p>
              <div className="mt-4 flex gap-2 justify-center">
                {!showDisconnectConfirm ? (
                  <Button variant="outline" size="sm" onClick={() => setShowDisconnectConfirm(true)} className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Disconnect
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDisconnectConfirm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={disconnectPartner} disabled={disconnecting} className="bg-red-500 hover:bg-red-600">
                      {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />}
                      Confirm Disconnect
                    </Button>
                  </div>
                )}
              </div>
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
