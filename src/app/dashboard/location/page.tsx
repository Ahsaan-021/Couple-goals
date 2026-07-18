'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, Navigation, Share2, RefreshCw, ToggleLeft, ToggleRight, Crosshair, Radio } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const dist = R * c
  if (dist < 1) return `${Math.round(dist * 1000)} m`
  return `${dist.toFixed(1)} km`
}

export default function LocationPage() {
  const { user, profile } = useAuth()
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [partnerLocation, setPartnerLocation] = useState<{ lat: number; lng: number; name?: string; updated_at: string } | null>(null)
  const [partnerName, setPartnerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [liveTracking, setLiveTracking] = useState(false)
  const [error, setError] = useState('')
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const watchIdRef = useRef<number | null>(null)
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user || !profile) return
    ;(async () => {
      if (profile.partner_id) {
        const { data: p } = await supabase.from('profiles').select('name').eq('id', profile.partner_id).single()
        if (p) setPartnerName(p.name)
      }
      if (profile.partner_id) {
        const { data: pLoc } = await supabase.from('locations').select('*').eq('user_id', profile.partner_id).maybeSingle()
        if (pLoc) setPartnerLocation({ lat: pLoc.latitude, lng: pLoc.longitude, name: pLoc.name || undefined, updated_at: pLoc.updated_at })
      }
      setLoading(false)
    })()
  }, [user, profile])

  // Realtime subscription for partner location
  useEffect(() => {
    if (!user || !profile?.partner_id) return
    const channel = supabase
      .channel('location-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'locations',
        filter: `user_id=eq.${profile.partner_id}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setPartnerLocation(null)
        } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const loc = payload.new as any
          setPartnerLocation({ lat: loc.latitude, lng: loc.longitude, name: loc.name || undefined, updated_at: loc.updated_at })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, profile?.partner_id])

  // Realtime subscription for own location deletions (from other device)
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('my-location-realtime')
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'locations',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        setMyLocation(null)
        setLiveTracking(false)
        stopLiveUpdates()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Initialize map
  useEffect(() => {
    if (loading) return
    if (!mapContainerRef.current) return
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 200)
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [loading])

  // Update markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })
    const bounds: [number, number][] = []
    if (myLocation) {
      bounds.push([myLocation.lat, myLocation.lng])
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:#f43f5e;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const marker = L.marker([myLocation.lat, myLocation.lng], { icon }).addTo(map)
      marker.bindPopup(`<b>You</b><br/>${myLocation.lat.toFixed(6)}, ${myLocation.lng.toFixed(6)}`)
    }
    if (partnerLocation) {
      bounds.push([partnerLocation.lat, partnerLocation.lng])
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      const marker = L.marker([partnerLocation.lat, partnerLocation.lng], { icon }).addTo(map)
      marker.bindPopup(`<b>${partnerName || 'Partner'}</b><br/>${partnerLocation.lat.toFixed(6)}, ${partnerLocation.lng.toFixed(6)}`)
    }
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    } else {
      map.setView([20, 78], 4)
    }
    map.invalidateSize()
  }, [myLocation, partnerLocation, partnerName])

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('Geolocation not supported'))
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
    })
  }

  const shareCurrentLocation = async () => {
    if (!user) return
    setLocating(true)
    setError('')
    try {
      const pos = await getCurrentPosition()
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setMyLocation({ lat, lng })
      await supabase.from('locations').upsert({
        user_id: user.id,
        latitude: lat,
        longitude: lng,
        name: 'Current Location',
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'user_id' })
    } catch (err: any) {
      setError(err.message || 'Failed to get location')
    } finally {
      setLocating(false)
    }
  }

  const stopLiveUpdates = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (liveIntervalRef.current !== null) {
      clearInterval(liveIntervalRef.current)
      liveIntervalRef.current = null
    }
  }

  const startLiveTracking = async () => {
    if (!user) return
    setLocating(true)
    setError('')
    try {
      const pos = await getCurrentPosition()
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setMyLocation({ lat, lng })
      await supabase.from('locations').upsert({
        user_id: user.id,
        latitude: lat,
        longitude: lng,
        name: 'Live Location',
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'user_id' })
      setLiveTracking(true)

      // Update location every 30s
      liveIntervalRef.current = setInterval(async () => {
        try {
          const p = await getCurrentPosition()
          const newLat = p.coords.latitude
          const newLng = p.coords.longitude
          setMyLocation({ lat: newLat, lng: newLng })
          await supabase.from('locations').upsert({
            user_id: user.id,
            latitude: newLat,
            longitude: newLng,
            name: 'Live Location',
            updated_at: new Date().toISOString(),
          } as any, { onConflict: 'user_id' })
        } catch {}
      }, 30000)
    } catch (err: any) {
      setError(err.message || 'Failed to get location')
    } finally {
      setLocating(false)
    }
  }

  const stopSharing = async () => {
    if (!user) return
    stopLiveUpdates()
    await supabase.from('locations').delete().eq('user_id', user.id)
    setMyLocation(null)
    setLiveTracking(false)
  }

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  const isSharing = myLocation !== null

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mx-auto" />
      </div>
    )
  }

  if (!profile?.partner_id) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-rose-300" />
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">No partner yet</p>
        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Pair up in Settings to share your locations</p>
      </div>
    )
  }

  const distance = myLocation && partnerLocation
    ? getDistance(myLocation.lat, myLocation.lng, partnerLocation.lat, partnerLocation.lng)
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Live Location</h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">See each other&apos;s real-time location</p>
          </div>
        </div>
        {isSharing ? (
          <Button size="sm" variant="outline" onClick={stopSharing} className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm whitespace-nowrap">
            <ToggleRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Stop Sharing
          </Button>
        ) : (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button size="sm" variant="outline" onClick={shareCurrentLocation} disabled={locating} className="text-xs sm:text-sm px-2.5 sm:px-4 whitespace-nowrap">
              {locating ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1" /> : <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />}
              <span className="hidden sm:inline">Current Location</span>
              <span className="sm:hidden">Current</span>
            </Button>
            <Button size="sm" onClick={startLiveTracking} disabled={locating} className="text-xs sm:text-sm px-2.5 sm:px-4 whitespace-nowrap">
              {locating ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1" /> : <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />}
              Live
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-card">
        <div ref={mapContainerRef} className="h-[400px] w-full" />
      </div>

      {distance && (
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400">
            <Navigation className="w-4 h-4 text-rose-400" />
            {distance} apart
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myLocation ? (
              <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                <p className="font-mono text-xs">{myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}</p>
                {liveTracking && (
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                    Live tracking active
                  </p>
                )}
                {!liveTracking && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    Current location shared
                  </p>
                )}
                <Button size="sm" variant="outline" onClick={() => openInMaps(myLocation.lat, myLocation.lng)} className="w-full">
                  Open in Google Maps
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-neutral-400 dark:text-neutral-500">Not sharing</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={shareCurrentLocation} disabled={locating}>
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Crosshair className="w-3.5 h-3.5 mr-1.5" />}
                    Share Once
                  </Button>
                  <Button size="sm" onClick={startLiveTracking} disabled={locating}>
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Radio className="w-3.5 h-3.5 mr-1.5" />}
                    Go Live
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              {partnerName || 'Partner'}&apos;s Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partnerLocation ? (
              <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                <p className="font-mono text-xs">{partnerLocation.lat.toFixed(6)}, {partnerLocation.lng.toFixed(6)}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Updated {new Date(partnerLocation.updated_at).toLocaleString()}
                </p>
                <Button size="sm" variant="outline" onClick={() => openInMaps(partnerLocation.lat, partnerLocation.lng)} className="w-full">
                  Open in Google Maps
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-400 dark:text-neutral-500">Location not shared yet</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Ask your partner to enable sharing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
