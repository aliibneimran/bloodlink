'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { EmergencyBoard } from '@/components/emergency-board'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Users, Activity } from 'lucide-react'
import type { BloodRequest } from '@/lib/types'

export default function DashboardPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
  })

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/blood-requests')
        const data = await response.json()
        setRequests(data)

        // Calculate stats
        const pending = data.filter((r: BloodRequest) => r.status === 'pending').length
        const accepted = data.filter((r: BloodRequest) => r.status === 'accepted').length
        const completed = data.filter((r: BloodRequest) => r.status === 'completed').length

        setStats({ pending, accepted, completed })
      } catch (error) {
        console.error('Failed to fetch requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchRequests, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Blood Donation Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Real-time blood requests and donor network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-80" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.accepted}</p>
              </div>
              <Activity className="h-8 w-8 text-primary opacity-80" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.completed}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-500 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Requests ({stats.pending})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading requests...</p>
              </Card>
            ) : (
              <EmergencyBoard requests={requests.filter((r) => r.status === 'pending')} />
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading requests...</p>
              </Card>
            ) : requests.filter((r) => r.status === 'accepted').length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No accepted requests yet</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests
                  .filter((r) => r.status === 'accepted')
                  .map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Blood Type</p>
                            <p className="text-2xl font-bold text-primary">{request.patient_blood_group}</p>
                          </div>
                          <Badge>Accepted</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{request.hospital_name}</p>
                          <p className="text-xs text-muted-foreground">Hospital</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading requests...</p>
              </Card>
            ) : requests.filter((r) => r.status === 'completed').length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No completed requests yet</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests
                  .filter((r) => r.status === 'completed')
                  .map((request) => (
                    <Card key={request.id} className="p-4 opacity-75">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Blood Type</p>
                            <p className="text-2xl font-bold text-foreground">{request.patient_blood_group}</p>
                          </div>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{request.hospital_name}</p>
                          <p className="text-xs text-muted-foreground">Hospital</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
