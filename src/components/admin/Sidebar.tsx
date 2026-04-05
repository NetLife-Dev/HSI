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
}

export function Sidebar({ session }: SidebarProps) {
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
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo area */}
      <div className={cn(
        'flex items-center h-16 border-b border-[var(--color-border)] px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <span className="font-semibold text-[var(--color-text-primary)] text-sm truncate">
            HostSemImposto
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-7 w-7 text-[var(--color-text-secondary)]"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Tooltip key={item.href} disableHoverableContent={!collapsed}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
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
        'border-t border-[var(--color-border)] p-3',
        collapsed ? 'flex justify-center' : 'flex items-center gap-3'
      )}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={session.user?.image ?? undefined} />
          <AvatarFallback className="text-xs bg-[var(--color-accent)] text-white">
            {session.user?.name?.charAt(0).toUpperCase() ?? 'A'}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {session.user?.name ?? 'Admin'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {session.user?.email ?? ''}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
