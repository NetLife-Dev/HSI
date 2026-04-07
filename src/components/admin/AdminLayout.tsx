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
    <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-accent selection:text-black">
      {/* Sidebar — desktop only */}
      <Sidebar session={session} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#050505] rounded-tl-3xl border-t border-l border-white/10 mt-2">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
