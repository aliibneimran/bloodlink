'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Droplet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (active) {
        setIsAuthenticated(Boolean(session?.user))
      }
    }

    void loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsAuthenticated(Boolean(session?.user))
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-primary p-2">
              <Droplet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">BloodLink</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/donor" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Become a Donor
            </Link>
            <Link href="/request" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Request Blood
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
          </nav>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Logout
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
