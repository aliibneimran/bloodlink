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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import type { BloodRequest } from '@/lib/types'

interface CancelDonationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: BloodRequest | null
  isLoading?: boolean
  onCancel: (reason: string) => void
}

export function CancelDonationDialog({ open, onOpenChange, request, isLoading, onCancel }: CancelDonationDialogProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (reason.trim()) {
      onCancel(reason)
      setReason('')
    }
  }

  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Donation</DialogTitle>
          <DialogDescription>Let us know why you need to cancel this donation commitment</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Cancellation Notice</p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                This cancellation will be logged. The request will return to pending status so other donors can help.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Cancellation
            </Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you need to cancel this donation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24 resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{reason.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Keep Donation
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? 'Cancelling...' : 'Cancel Donation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
