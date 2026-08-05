'use client'

import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { Loader } from 'lucide-react'
import type { Donor } from '@/lib/types'

const MapTrackingContent = dynamic(() => import('./map-tracking-content').then(mod => ({ default: mod.MapTrackingContent })), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg border border-border bg-muted flex items-center justify-center">
    <Loader className="h-6 w-6 animate-spin text-primary" />
  </div>,
})

interface LiveTrackingMapProps {
  donors: Donor[]
  hospitalLat: number
  hospitalLng: number
  acceptedDonorId?: string
  radius?: number
}

export function LiveTrackingMap({ donors, hospitalLat, hospitalLng, acceptedDonorId, radius = 5000 }: LiveTrackingMapProps) {
  return (
    <MapTrackingContent
      donors={donors}
      hospitalLat={hospitalLat}
      hospitalLng={hospitalLng}
      acceptedDonorId={acceptedDonorId}
      radius={radius}
    />
  )
}
