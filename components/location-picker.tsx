'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
}

// Lazy load the map to avoid SSR issues
const MapContent = dynamic(() => import('./map-content').then(mod => ({ default: mod.MapContent })), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg border border-border bg-muted flex items-center justify-center">
    <Loader className="h-6 w-6 animate-spin text-primary" />
  </div>,
})

export function LocationPicker({ onLocationSelect, initialLat = 40, initialLng = -95 }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setPosition([latitude, longitude])
          setIsLoading(false)
        },
        () => {
          setIsLoading(false)
        }
      )
    }
  }, [])

  const handleLocationSelect = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onLocationSelect(lat, lng)
  }

  return (
    <div className="space-y-4">
      <MapContent position={position} onLocationSelect={handleLocationSelect} />
      <Button
        onClick={() => {
          setIsLoading(true)
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords
              handleLocationSelect(latitude, longitude)
              setIsLoading(false)
            })
          }
        }}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? 'Getting location...' : 'Use Current Location'}
      </Button>
    </div>
  )
}
