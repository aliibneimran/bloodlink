'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { Badge } from '@/components/ui/badge'
import type { Donor } from '@/lib/types'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
const hospitalIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const donorIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface MapTrackingContentProps {
  donors: Donor[]
  hospitalLat: number
  hospitalLng: number
  acceptedDonorId?: string
  radius?: number
}

export function MapTrackingContent({ donors, hospitalLat, hospitalLng, acceptedDonorId, radius = 5000 }: MapTrackingContentProps) {
  const mapRef = useRef(null)

  useEffect(() => {
    // Center map on hospital
    if (mapRef.current) {
      const map = (mapRef.current as any).leafletElement || (mapRef.current as any)._leaflet_map
      if (map) {
        map.setView([hospitalLat, hospitalLng], 12)
      }
    }
  }, [hospitalLat, hospitalLng])

  const acceptedDonor = donors.find((d) => d.id === acceptedDonorId)

  return (
    <div className="relative h-96 w-full rounded-lg border border-border overflow-hidden">
      <MapContainer ref={mapRef} center={[hospitalLat, hospitalLng]} zoom={12} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Search radius */}
        <Circle center={[hospitalLat, hospitalLng]} radius={radius} pathOptions={{ color: 'blue', fillOpacity: 0.1 }} />

        {/* Hospital location */}
        <Marker position={[hospitalLat, hospitalLng]} icon={hospitalIcon}>
          <Popup>Hospital Location</Popup>
        </Marker>

        {/* Donors */}
        {donors.map((donor) => (
          <Marker key={donor.id} position={[donor.lat, donor.lng]} icon={donorIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{donor.name}</p>
                <p className="text-sm">{donor.blood_group}</p>
                <Badge variant={donor.id === acceptedDonorId ? 'default' : 'secondary'}>
                  {donor.id === acceptedDonorId ? 'Accepted' : 'Available'}
                </Badge>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
