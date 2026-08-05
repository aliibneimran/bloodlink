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
import { Droplet, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { BLOOD_TYPES } from '@/lib/constants'

type Step = 'info' | 'location' | 'success'

export default function DonorPage() {
  const [step, setStep] = useState<Step>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [donorId, setDonorId] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    blood_group: '',
    latitude: 0,
    longitude: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBloodGroupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, blood_group: value }))
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
    submitForm(lat, lng)
  }

  const submitForm = async (lat?: number, lng?: number) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          blood_group: formData.blood_group,
          is_donor: true,
          latitude: lat || formData.latitude,
          longitude: lng || formData.longitude,
        }),
      })

      const responseText = await response.text()
      console.log('profiles POST response', { status: response.status, responseText })
      let data: any = null
      if (responseText) {
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error(`Server returned invalid JSON: ${responseText}`)
        }
      }

      if (!response.ok) {
        const message = data?.error || response.statusText || 'Failed to register as donor'
        throw new Error(message)
      }

      if (!data || !data.id) {
        throw new Error('Registration succeeded but server returned no donor ID.')
      }

      setDonorId(data.id)
      setStep('success')
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueToLocation = () => {
    if (!formData.name || !formData.phone || !formData.blood_group) {
      alert('Please fill in all fields')
      return
    }
    setStep('location')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'info' || step === 'location' || step === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            1
          </div>
          <div className="h-1 w-12 bg-muted" />
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'location' || step === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </div>
          <div className="h-1 w-12 bg-muted" />
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            3
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 'info' && (
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Droplet className="h-8 w-8 text-primary" />
                Become a Blood Donor
              </h1>
              <p className="mt-2 text-muted-foreground">
                Register as a donor and help save lives in your community
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="blood-group" className="text-sm font-medium">
                  Blood Type
                </Label>
                <Select value={formData.blood_group} onValueChange={handleBloodGroupChange}>
                  <SelectTrigger id="blood-group" className="mt-2">
                    <SelectValue placeholder="Select your blood type" />
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
            </div>

            <Button
              onClick={handleContinueToLocation}
              disabled={isLoading || !formData.name || !formData.phone || !formData.blood_group}
              className="w-full"
            >
              Continue to Location
            </Button>
          </Card>
        )}

        {/* Step 2: Location Selection */}
        {step === 'location' && (
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Select Your Location</h1>
              <p className="mt-2 text-muted-foreground">
                Click on the map or use your current location so nearby patients can find you
              </p>
            </div>

            <LocationPicker onLocationSelect={handleLocationSelect} />

            <Button
              onClick={() => setStep('info')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Back
            </Button>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <Card className="p-6 md:p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Welcome to BloodLink!</h1>
              <p className="text-muted-foreground">
                You&apos;re now registered as a blood donor. You&apos;ll receive notifications when blood is needed near you.
              </p>
            </div>

            <div className="rounded-lg bg-primary/10 p-4 text-left">
              <p className="text-sm font-semibold text-foreground mb-2">Your Donor ID:</p>
              <p className="font-mono text-sm text-primary break-all">{donorId}</p>
            </div>

            <div className="space-y-3 flex flex-col">
              <Link href="/dashboard" className="block">
                <Button className="w-full">View Dashboard</Button>
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
