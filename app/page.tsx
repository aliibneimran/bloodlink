import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Droplet, MapPin, Zap, Heart, Users, Shield } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'BloodLink - Save Lives with Blood Donation',
  description: 'Connect blood donors with patients in need through our real-time tracking system. Find nearby donors instantly for emergency blood requests.',
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'BloodLink - Blood Donation Network',
    description: 'Real-time blood donation platform connecting donors with patients in need',
    url: 'https://bloodlink.app',
  }

  return (
    <>
      <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    Save Lives with <span className="text-primary">Blood Donation</span>
                  </h1>
                  <p className="text-lg text-muted-foreground sm:text-xl">
                    Connect with nearby donors in real-time. Emergency blood requests matched with available donors instantly.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/donor" className="block">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Droplet className="mr-2 h-5 w-5" />
                      Become a Donor
                    </Button>
                  </Link>
                  <Link href="/request" className="block">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <Heart className="mr-2 h-5 w-5" />
                      Request Blood
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative h-96 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Droplet className="h-40 w-40 text-primary opacity-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border/40 px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why BloodLink?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our platform makes blood donation faster, safer, and more efficient
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Zap,
                  title: 'Instant Matching',
                  description: 'Real-time matching of blood requests with nearby available donors',
                },
                {
                  icon: MapPin,
                  title: 'Location-Based',
                  description: 'Find donors within your area and hospitals instantly',
                },
                {
                  icon: Heart,
                  title: 'Emergency Ready',
                  description: 'Optimize response time for urgent blood transfusions',
                },
                {
                  icon: Users,
                  title: 'Community Driven',
                  description: 'Connect with a network of committed blood donors',
                },
                {
                  icon: Shield,
                  title: 'Secure & Safe',
                  description: 'All data is encrypted and protected with hospital standards',
                },
                {
                  icon: Droplet,
                  title: 'Blood Type Matching',
                  description: 'Smart matching based on blood types and donor availability',
                },
              ].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <Card key={idx} className="p-6 hover:border-primary/50 transition-colors">
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border/40 px-4 py-20 sm:px-6 sm:py-32 lg:px-8 bg-primary/5">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ready to Make a Difference?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of donors saving lives every day. Whether you&apos;re a donor or need blood, BloodLink connects you instantly.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/donor">
                <Button size="lg" className="w-full sm:w-auto">
                  <Droplet className="mr-2 h-5 w-5" />
                  Get Started as Donor
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-2">
                <Droplet className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">BloodLink</span>
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; 2024 BloodLink. All rights reserved. Saving lives, one donation at a time.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
