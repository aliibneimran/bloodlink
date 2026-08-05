'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, MapPin, Clock, Droplet } from 'lucide-react'
import type { BloodRequest, Donor } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface AcceptRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: BloodRequest | null
  donor: Donor | null
  isLoading?: boolean
  onAccept: () => void
}

export function AcceptRequestDialog({ open, onOpenChange, request, donor, isLoading, onAccept }: AcceptRequestDialogProps) {
  if (!request || !donor) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Blood Request</DialogTitle>
          <DialogDescription>Confirm you can donate for this urgent blood request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Request Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Blood Type</p>
                  <p className="text-sm font-semibold text-foreground">{request.patient_blood_group}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Request Type</p>
                <Badge variant={request.request_type === 'instant' ? 'destructive' : 'secondary'} className="mt-1">
                  {request.request_type === 'instant' ? 'URGENT' : 'Pre-booking'}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Hospital</p>
                <p className="text-sm font-semibold text-foreground">{request.hospital_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Required by</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDistanceToNow(new Date(request.required_date), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Important</p>
              <p className="text-xs text-muted-foreground mt-1">
                Once you accept, you commit to donate. Cancellations will be logged. Please ensure you&apos;re eligible to donate.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAccept} disabled={isLoading} className="bg-primary">
            {isLoading ? 'Accepting...' : 'Accept Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
