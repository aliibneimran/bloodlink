'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Header } from '@/components/header'
import { EmergencyBoard } from '@/components/emergency-board'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Users, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { BloodRequest } from '@/lib/types'

export default function DashboardPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
  })
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (active) {
        setUser(session?.user ?? null)
      }
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    let active = true

    const fetchRequests = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const response = await fetch('/api/blood-requests?my=true', {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        })

        if (!response.ok) {
          throw new Error('Failed to load requests')
        }

        const data = await response.json()
        if (!active) return

        setRequests(data)

        const pending = data.filter((r: BloodRequest) => r.status === 'pending').length
        const accepted = data.filter((r: BloodRequest) => r.status === 'accepted').length
        const completed = data.filter((r: BloodRequest) => r.status === 'completed').length

        setStats({ pending, accepted, completed })
      } catch (error) {
        console.error('Failed to fetch requests:', error)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void fetchRequests()

    const interval = window.setInterval(() => {
      void fetchRequests()
    }, 10000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [user])

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault()
    setAuthError('')
    setIsAuthLoading(true)

    try {
      let result
      if (authMode === 'signin') {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }

      if (result.error) {
        throw result.error
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'
      setAuthError(message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRequests([])
    setStats({ pending: 0, accepted: 0, completed: 0 })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto flex max-w-2xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Access the dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in or create an account to view and manage blood requests.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              {authError ? <p className="text-sm text-destructive">{authError}</p> : null}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isAuthLoading} className="flex-1">
                  {isAuthLoading ? 'Please wait...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                >
                  {authMode === 'signin' ? 'Create account' : 'Sign in'}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blood Donation Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Real-time blood requests and donor network</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
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
