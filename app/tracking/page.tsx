'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { LiveTrackingMap } from '@/components/live-tracking-map'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AcceptRequestDialog } from '@/components/dialogs/accept-request-dialog'
import { CancelDonationDialog } from '@/components/dialogs/cancel-donation-dialog'
import {
  MapPin,
  Clock,
  Droplet,
  AlertCircle,
  Phone,
  User,
  Loader,
} from 'lucide-react'
import type { BloodRequest, Donor } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

export default function TrackingPage() {
  const [requestId, setRequestId] = useState('')
  const [request, setRequest] = useState<BloodRequest | null>(null)
  const [donors, setDonors] = useState<Donor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [currentDonor, setCurrentDonor] = useState<Donor | null>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestId.trim()) return

    setIsSearching(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const authHeaders = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}

      const response = await fetch(`/api/blood-requests?status=pending`, { headers: authHeaders })
      const data = await response.json()
      const found = data.find((r: any) => r.id === requestId)

      if (!found) {
        alert('Request not found')
        setRequest(null)
        setDonors([])
        return
      }

      setRequest(found)

      // Fetch nearby donors
      if (found.hospital_location) {
        const coords = found.hospital_location.split('(')[1].split(')')[0].split(' ')
        const lng = parseFloat(coords[0])
        const lat = parseFloat(coords[1])

        const donorResponse = await fetch(
          `/api/donors/nearby?lat=${lat}&lng=${lng}&blood_type=${found.patient_blood_group}&radius=5`,
          { headers: authHeaders }
        )
        const donorData = await donorResponse.json()

        // Map to our Donor type
        const mappedDonors: Donor[] = donorData.map((d: any) => ({
          id: d.id,
          name: d.name,
          phone: d.phone,
          blood_group: d.blood_group,
          status: d.status,
          lat,
          lng,
          distance_m: d.distance_m,
        }))

        setDonors(mappedDonors)
      }
    } catch (error) {
      console.error('Failed to search:', error)
      alert('Failed to search for request')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAccept = async () => {
    if (!request || !currentDonor || !currentProfile) return

    setIsLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const response = await fetch('/api/blood-requests/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
        body: JSON.stringify({
          request_id: request.id,
          donor_id: currentProfile.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Successfully accepted the blood request! You will be contacted by the hospital.')
      setAcceptDialogOpen(false)
      setRequest(null)
      setRequestId('')
      setDonors([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept request'
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (reason: string) => {
    if (!request || !currentProfile) return

    setIsLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const response = await fetch('/api/blood-requests/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
        body: JSON.stringify({
          request_id: request.id,
          donor_id: currentProfile.id,
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Donation cancelled and logged. The request is back to pending status.')
      setCancelDialogOpen(false)
      setRequest(null)
      setRequestId('')
      setDonors([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel'
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptClick = (donor: Donor) => {
    setCurrentDonor(donor)
    setAcceptDialogOpen(true)
  }

  const initiateDonorRegistration = () => {
    // Get donor from list and create profile if needed
    const donor = donors[0]
    if (donor) {
      setCurrentDonor(donor)
      // In a real app, you'd register the donor here
      setAcceptDialogOpen(true)
    }
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-8 w-8 text-primary" />
                Track Blood Request
              </h1>
              <p className="mt-2 text-muted-foreground">
                Enter a request ID to view its details and nearby donors
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="request-id" className="text-sm font-medium">
                  Request ID
                </Label>
                <Input
                  id="request-id"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <Button type="submit" disabled={isSearching || !requestId.trim()} className="w-full">
                {isSearching ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search Request'
                )}
              </Button>
            </form>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Request IDs are provided when creating a blood request. You can search for any pending or accepted request to track its status.
              </p>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Request Summary */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Request Details</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Blood Type</p>
              <p className="text-3xl font-bold text-primary">{request.patient_blood_group}</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <Badge variant={request.status === 'accepted' ? 'default' : 'secondary'}>
                {request.status.toUpperCase()}
              </Badge>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Hospital</p>
              <p className="font-semibold text-foreground">{request.hospital_name}</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Needed By</p>
              <p className="font-semibold text-foreground">
                {formatDistanceToNow(new Date(request.required_date), { addSuffix: true })}
              </p>
            </Card>
          </div>
        </div>

        {/* Live Tracking Map */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Nearby Donors</h2>
          <LiveTrackingMap
            donors={donors}
            hospitalLat={
              request.hospital_location
                ? parseFloat(request.hospital_location.split('(')[1].split(')')[0].split(' ')[1])
                : 0
            }
            hospitalLng={
              request.hospital_location
                ? parseFloat(request.hospital_location.split('(')[1].split(')')[0].split(' ')[0])
                : 0
            }
            acceptedDonorId={request.accepted_by_donor_id}
            radius={5000}
          />
        </div>

        {/* Available Donors List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Available Donors ({donors.length})
          </h2>

          {donors.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-semibold">No Donors Found</p>
              <p className="text-sm text-muted-foreground mt-2">
                No nearby donors with {request.patient_blood_group} blood type are currently available
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {donors.map((donor) => (
                <Card key={donor.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-foreground">{donor.name}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="h-4 w-4 text-primary" />
                          <p className="text-sm text-muted-foreground">{donor.blood_group}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <p className="text-sm font-mono text-muted-foreground">{donor.phone}</p>
                        </div>
                      </div>
                      <Badge>{donor.status}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {donor.distance_m && donor.distance_m < 1000
                        ? `${(donor.distance_m / 1000).toFixed(1)} km away`
                        : `${(donor.distance_m / 1000).toFixed(1)} km away`}
                    </div>

                    <Button onClick={() => handleAcceptClick(donor)} className="w-full">
                      Request This Donor
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {request.status === 'accepted' && (
            <Button
              onClick={() => setCancelDialogOpen(true)}
              variant="destructive"
              className="flex-1"
            >
              Cancel Donation
            </Button>
          )}
          <Button
            onClick={() => {
              setRequest(null)
              setRequestId('')
              setDonors([])
            }}
            variant="outline"
            className="flex-1"
          >
            Search Another Request
          </Button>
        </div>
      </main>

      {/* Dialogs */}
      <AcceptRequestDialog
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        request={request}
        donor={currentDonor}
        isLoading={isLoading}
        onAccept={handleAccept}
      />

      <CancelDonationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        request={request}
        isLoading={isLoading}
        onCancel={handleCancel}
      />
    </div>
  )
}
