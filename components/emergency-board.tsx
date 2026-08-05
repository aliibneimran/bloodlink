'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, MapPin, Clock } from 'lucide-react'
import type { BloodRequest } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface EmergencyBoardProps {
  requests: BloodRequest[]
  onRequestClick?: (request: BloodRequest) => void
}

export function EmergencyBoard({ requests, onRequestClick }: EmergencyBoardProps) {
  const pendingRequests = requests.filter((r) => r.status === 'pending')

  if (pendingRequests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-foreground font-semibold">No Active Requests</p>
        <p className="text-sm text-muted-foreground">All blood requests have been fulfilled</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">{pendingRequests.length} Active Blood Requests</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingRequests.map((request) => (
          <Card
            key={request.id}
            className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onRequestClick?.(request)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Blood Type Needed</p>
                  <p className="text-2xl font-bold text-primary">{request.patient_blood_group}</p>
                </div>
                <Badge variant={request.request_type === 'instant' ? 'destructive' : 'secondary'}>
                  {request.request_type === 'instant' ? 'URGENT' : 'Pre-booking'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{request.hospital_name}</p>
                    <p className="text-xs text-muted-foreground">Hospital</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDistanceToNow(new Date(request.required_date), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground">Required by</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => onRequestClick?.(request)}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
