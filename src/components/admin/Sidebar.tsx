'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Session } from 'next-auth'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NAV_ITEMS } from './nav-items'

const COLLAPSED_KEY = 'admin-sidebar-collapsed'

interface SidebarProps {
  session: Session
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ session, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, String(next))
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-black transition-all duration-300 border-r border-white/5 md:relative md:z-auto',
          collapsed ? 'md:w-20' : 'md:w-64',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className={cn(
          'flex items-center h-24 px-6',
          collapsed ? 'md:justify-center' : 'justify-between'
        )}>
          {(!collapsed || mobileOpen) && (
            <span className="font-black text-2xl uppercase tracking-tighter text-white">
              Host<span className="text-accent">SI</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden md:flex h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
            aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
          
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden h-8 w-8 text-white/40 hover:text-white"
          >
            <ChevronLeft size={16} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 space-y-2 px-4 overflow-y-auto overflow-x-hidden">
          <TooltipProvider delayDuration={0}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              const linkClassName = cn(
                'flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all',
                isActive
                  ? 'bg-accent text-black scale-105 shadow-xl shadow-accent/10'
                  : 'text-white/40 hover:bg-white/5 hover:text-white hover:scale-105',
                (collapsed && !mobileOpen) && 'md:justify-center px-2'
              )

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger
                    render={(props) => (
                      <Link
                        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                        href={item.href}
                        onClick={onClose}
                        className={linkClassName}
                      >
                        <Icon size={20} className="shrink-0" />
                        {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                      </Link>
                    )}
                  />
                  {(collapsed && !mobileOpen) && (
                    <TooltipContent side="right" className="bg-white text-black font-black uppercase tracking-widest">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>


      {/* User profile at bottom */}
      <div className={cn(
        'p-6 pt-10 border-t border-white/5 bg-gradient-to-t from-[#050505] to-transparent',
        collapsed ? 'flex justify-center' : 'flex items-center gap-4'
      )}>
        <Avatar className="h-10 w-10 shrink-0 border border-white/10 shadow-xl shadow-accent/5">
          <AvatarImage src={session.user?.image ?? undefined} />
          <AvatarFallback className="text-sm font-black bg-accent text-black uppercase">
            {session.user?.name?.charAt(0) ?? 'A'}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white uppercase tracking-wider truncate">
              {session.user?.name ?? 'Admin'}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">
              {session.user?.email ?? ''}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
