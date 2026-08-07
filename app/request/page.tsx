'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { LocationPicker } from '@/components/location-picker'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { BLOOD_TYPES, REQUEST_TYPES } from '@/lib/constants'
import { buildAuthPassword } from '@/lib/auth/bootstrap'
import { supabase } from '@/lib/supabase/client'

type Step = 'requester' | 'hospital' | 'location' | 'success'

export default function RequestPage() {
  const [step, setStep] = useState<Step>('requester')
  const [isLoading, setIsLoading] = useState(false)
  const [requestId, setRequestId] = useState<string>('')

  const [formData, setFormData] = useState({
    requester_name: '',
    requester_phone: '',
    patient_blood_group: '',
    request_type: 'instant',
    hospital_name: '',
    hospital_lat: 0,
    hospital_lng: 0,
    required_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleLocationSelect = async (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      hospital_lat: lat,
      hospital_lng: lng,
    }))

    // Create requester profile and blood request
    await submitForm(lat, lng)
  }

  const submitForm = async (lat?: number, lng?: number) => {
    setIsLoading(true)
    try {
      // First, create or get requester profile
      let requesterData: any = null
      try {
        const profileRes = await fetch('/api/profiles?phone=' + encodeURIComponent(formData.requester_phone))
        if (profileRes.ok) {
          requesterData = await profileRes.json()
        } else {
          requesterData = null
        }
      } catch (e) {
        requesterData = null
      }

      if (!requesterData) {
        // Create new requester profile and auto-auth account
        const profileRes = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.requester_name,
            phone: formData.requester_phone,
            is_donor: false,
          }),
        })

        if (!profileRes.ok) throw new Error('Failed to create requester profile')
        requesterData = await profileRes.json()
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session && requesterData?.auth?.email && !requesterData?.auth?.authError) {
        await supabase.auth.signInWithPassword({
          email: requesterData.auth.email,
          password: buildAuthPassword(formData.requester_phone),
        })
      }

      const authSession = await supabase.auth.getSession()
      const authHeaders: Record<string, string> = authSession.data.session?.access_token
        ? { Authorization: `Bearer ${authSession.data.session.access_token}` }
        : {}

      const requestRes = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          requester_id: requesterData.id,
          patient_blood_group: formData.patient_blood_group,
          request_type: formData.request_type,
          hospital_name: formData.hospital_name,
          hospital_lat: lat || formData.hospital_lat,
          hospital_lng: lng || formData.hospital_lng,
          required_date: new Date(formData.required_date).toISOString(),
        }),
      })

      if (!requestRes.ok) throw new Error('Failed to create blood request')
      const requestData = await requestRes.json()
      if (requestData?.auth?.userId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session && requestData?.auth?.email && !requestData?.auth?.authError) {
          try {
            await supabase.auth.signInWithPassword({
              email: requestData.auth.email,
              password: buildAuthPassword(formData.requester_phone),
            })
          } catch (authErr) {
            console.error('Auto sign-in failed:', authErr)
          }
        }
      }

      if (requestData?.auth?.authError) {
        console.warn('Auth setup failed:', requestData.auth.authError)
      }
      setRequestId(requestData.id)
      setStep('success')
    } catch (error) {
      console.error('Error:', error)
      
      let message = 'Failed to create request. Please try again.'
      
      if (error instanceof Error) {
        message = error.message
        
        if (message.includes('RLS_POLICY_ERROR') || message.includes('migration script')) {
          message = `${message}\n\nPlease run the migration script at lib/migrations/001-fix-rls-policies.sql in your Supabase SQL Editor and try again.`
        }
      }
      
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = (nextStep: Step) => {
    if (step === 'requester') {
      if (!formData.requester_name || !formData.requester_phone) {
        alert('Please fill in all requester information')
        return
      }
    } else if (step === 'hospital') {
      if (!formData.patient_blood_group || !formData.hospital_name || !formData.required_date) {
        alert('Please fill in all blood request details')
        return
      }
    }
    setStep(nextStep)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {['requester', 'hospital', 'location', 'success'].map((s, idx) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step === s || (['hospital', 'location', 'success'].includes(step) && ['hospital', 'location', 'success'].includes(s) && ['hospital', 'location', 'success'].indexOf(step) >= idx - 1)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 3 && <div className="h-1 w-12 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step 1: Requester Information */}
        {step === 'requester' && (
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="h-8 w-8 text-primary" />
                Request Blood
              </h1>
              <p className="mt-2 text-muted-foreground">
                Create an emergency blood request. Nearby donors will be notified.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="requester-name" className="text-sm font-medium">
                  Your Full Name
                </Label>
                <Input
                  id="requester-name"
                  name="requester_name"
                  placeholder="John Doe"
                  value={formData.requester_name}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="requester-phone" className="text-sm font-medium">
                  Your Phone Number
                </Label>
                <Input
                  id="requester-phone"
                  name="requester_phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.requester_phone}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            <Button onClick={() => handleContinue('hospital')} disabled={isLoading} className="w-full">
              Continue to Blood Request
            </Button>
          </Card>
        )}

        {/* Step 2: Blood Request Details */}
        {step === 'hospital' && (
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blood Request Details</h1>
              <p className="mt-2 text-muted-foreground">
                Provide information about the blood needed
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="blood-group" className="text-sm font-medium">
                  Blood Type Needed
                </Label>
                <Select
                  value={formData.patient_blood_group}
                  onValueChange={(value) => handleSelectChange(value ?? '', 'patient_blood_group')}
                >
                  <SelectTrigger id="blood-group" className="mt-2">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="request-type" className="text-sm font-medium">
                  Request Type
                </Label>
                <Select
                  value={formData.request_type}
                  onValueChange={(value) => handleSelectChange(value ?? '', 'request_type')}
                >
                  <SelectTrigger id="request-type" className="mt-2">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hospital-name" className="text-sm font-medium">
                  Hospital Name
                </Label>
                <Input
                  id="hospital-name"
                  name="hospital_name"
                  placeholder="City Medical Center"
                  value={formData.hospital_name}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="required-date" className="text-sm font-medium">
                  Blood Needed By
                </Label>
                <Input
                  id="required-date"
                  name="required_date"
                  type="date"
                  value={formData.required_date}
                  onChange={handleInputChange}
                  className="mt-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('requester')} variant="outline" disabled={isLoading} className="flex-1">
                Back
              </Button>
              <Button onClick={() => handleContinue('location')} disabled={isLoading} className="flex-1">
                Continue to Location
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Hospital Location */}
        {step === 'location' && (
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hospital Location</h1>
              <p className="mt-2 text-muted-foreground">
                Mark the hospital location so nearby donors can reach you quickly
              </p>
            </div>

            <LocationPicker onLocationSelect={handleLocationSelect} />

            <Button
              onClick={() => setStep('hospital')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Back
            </Button>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <Card className="p-6 md:p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Blood Request Created!</h1>
              <p className="text-muted-foreground">
                Nearby donors have been notified and will start responding to your request.
              </p>
            </div>

            <div className="rounded-lg bg-primary/10 p-4 text-left space-y-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Request ID</p>
                <p className="font-mono text-sm text-primary break-all">{requestId}</p>
              </div>
              <div className="pt-2 border-t border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Keep this ID handy to track your request status on the dashboard.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                You will receive notifications as donors accept your request. Please keep your phone nearby.
              </p>
            </div>

            <div className="space-y-3 flex flex-col">
              <Link href="/dashboard" className="block">
                <Button className="w-full">Track Your Request</Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
