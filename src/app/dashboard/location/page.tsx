'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, Navigation, Share2, RefreshCw } from 'lucide-react'

export default function LocationPage() {
  const { user, profile } = useAuth()
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [partnerLocation, setPartnerLocation] = useState<{ lat: number; lng: number; name?: string; updated_at: string } | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !profile) return
    ;(async () => {
      if (profile.partner_id) {
        const { data: p } = await supabase.from('profiles').select('name').eq('id', profile.partner_id).single()
        if (p) setPartnerName(p.name)
      }

      const { data: myLoc } = await supabase.from('locations').select('*').eq('user_id', user.id).maybeSingle()
      if (myLoc) setMyLocation({ lat: myLoc.latitude, lng: myLoc.longitude })

      if (profile.partner_id) {
        const { data: pLoc } = await supabase.from('locations').select('*').eq('user_id', profile.partner_id).maybeSingle()
        if (pLoc) setPartnerLocation({ lat: pLoc.latitude, lng: pLoc.longitude, name: pLoc.name || undefined, updated_at: pLoc.updated_at })
      }

      setLoading(false)
    })()
  }, [user, profile])

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('Geolocation not supported'))
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
    })
  }

  const shareLocation = async () => {
    if (!user) return
    setLocating(true)
    setError('')
    try {
      const pos = await getCurrentPosition()
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setMyLocation({ lat, lng })
      setLocating(false)
      setSharing(true)

      await supabase.from('locations').upsert({
        user_id: user.id,
        latitude: lat,
        longitude: lng,
        name: 'Current Location',
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'user_id' })

      setSharing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to get location')
      setLocating(false)
    }
  }

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mx-auto" />
      </div>
    )
  }

  if (!profile?.partner_id) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-rose-300" />
        </div>
        <p className="text-neutral-500 font-medium">No partner connected</p>
        <p className="text-sm text-neutral-400 mt-1">Connect with your partner in Settings to share locations</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Live Location</h1>
          <p className="text-sm text-neutral-400">Share your location with your partner</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {myLocation ? (
              <div>
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-7 h-7 text-rose-500" />
                </div>
                <p className="text-xs text-neutral-400 font-mono mb-3">
                  {myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => openInMaps(myLocation.lat, myLocation.lng)}>
                    Open in Maps
                  </Button>
                  <Button size="sm" variant="outline" onClick={shareLocation} disabled={locating || sharing}>
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-7 h-7 text-neutral-300" />
                </div>
                <Button onClick={shareLocation} disabled={locating || sharing} className="w-full">
                  {locating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {locating ? 'Getting location...' : 'Share My Location'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {partnerName || 'Partner'}&apos;s Location
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {partnerLocation ? (
              <div>
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-xs text-neutral-400 font-mono mb-1">
                  {partnerLocation.lat.toFixed(6)}, {partnerLocation.lng.toFixed(6)}
                </p>
                <p className="text-[10px] text-neutral-300 mb-3">
                  Updated {new Date(partnerLocation.updated_at).toLocaleString()}
                </p>
                <Button size="sm" variant="outline" onClick={() => openInMaps(partnerLocation.lat, partnerLocation.lng)}>
                  Open in Maps
                </Button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-7 h-7 text-neutral-300" />
                </div>
                <p className="text-sm text-neutral-400">Location not shared yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
