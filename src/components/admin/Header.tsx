'use client'

import { signOut } from 'next-auth/react'
import { type Session } from 'next-auth'
import { Bell, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  session: Session
}

export function Header({ session }: HeaderProps) {
  // Phase 1: Notification count is always 0 (shell only — wired in Phase 5)
  const unreadCount = 0

  return (
    <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 shrink-0">
      {/* Left: page title placeholder (each page will provide its own via a context or Portal in later phases) */}
      <div className="text-sm font-medium text-[var(--color-text-secondary)]">
        Painel de Gestão
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notificações">
          <Bell size={18} className="text-[var(--color-text-secondary)]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-9 w-9 rounded-full inline-flex items-center justify-center hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
            <Avatar className="h-7 w-7">
              <AvatarImage src={session.user?.image ?? undefined} />
              <AvatarFallback className="text-xs bg-[var(--color-accent)] text-white">
                {session.user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {session.user?.name ?? 'Admin'}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {session.user?.email ?? ''}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User size={14} className="mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={14} className="mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
