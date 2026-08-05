'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
})

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvent('click', (e) => {
    onLocationSelect(e.latlng.lat, e.latlng.lng)
  })
  return null
}

export function MapContent({ position, onLocationSelect }: { position: [number, number]; onLocationSelect: (lat: number, lng: number) => void }) {
  return (
    <div className="relative h-96 w-full rounded-lg border border-border overflow-hidden">
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Selected location</Popup>
        </Marker>
        <MapClickHandler onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  )
}
