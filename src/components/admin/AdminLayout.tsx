import { useState } from 'react'
import { type Session } from 'next-auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

interface AdminLayoutProps {
  children: React.ReactNode
  session: Session
}

export function AdminLayout({ children, session }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-accent selection:text-black">
      {/* Sidebar */}
      <Sidebar 
        session={session} 
        mobileOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header session={session} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] md:rounded-tl-3xl border-t border-white/10 md:border-l mt-2">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  )
}

