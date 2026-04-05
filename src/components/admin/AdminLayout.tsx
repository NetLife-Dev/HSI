'use client'

import { type Session } from 'next-auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

interface AdminLayoutProps {
  children: React.ReactNode
  session: Session
}

export function AdminLayout({ children, session }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar — desktop only */}
      <Sidebar session={session} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
