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
         <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button 
                  {...props}
                  variant="ghost" 
                  size="icon" 
                  className="relative h-9 w-9" 
                  aria-label="Notificações"
                >
                  <Bell size={18} className="text-[var(--color-text-secondary)]" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] animate-pulse"
                  >
                    3
                  </Badge>
                </Button>
              )}
            />
           <DropdownMenuContent align="end" className="w-80 p-0">
             <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <p className="font-bold text-sm">Notificações</p>
                 <span className="text-[10px] text-primary font-bold uppercase cursor-pointer hover:underline">Marcar todas lidas</span>
             </div>
             <div className="max-h-[300px] overflow-y-auto">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                   <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Nova Reserva Confirmada</p>
                   <p className="text-xs text-slate-500 mt-1">Fernando Silva fechou Refúgio da Mata por R$ 6.600.</p>
                   <p className="text-[10px] text-slate-400 mt-2 font-medium">Há 5 min</p>
                </div>
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                   <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Lead Pede Contato</p>
                   <p className="text-xs text-slate-500 mt-1">Marcela preencheu os dados, mas abandonou o Checkout.</p>
                   <p className="text-[10px] text-slate-400 mt-2 font-medium">Há 20 min</p>
                </div>
                 <div className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex gap-2 items-center">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      Atenção: Check-in Hoje
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Jéssica fará o Check-in às 14:00 na Villa Ocean View.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Há 2 horas</p>
                 </div>
             </div>
             <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                 <button className="text-xs text-primary font-bold hover:underline">Ver todo o histórico</button>
             </div>
           </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
         <DropdownMenu>
           <DropdownMenuTrigger
             render={(props) => (
               <div 
                 {...props}
                 className="h-9 w-9 rounded-full inline-flex items-center justify-center hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer overflow-hidden"
               >
                 <Avatar className="h-7 w-7">
                   <AvatarImage src={session.user?.image ?? undefined} />
                   <AvatarFallback className="text-xs bg-[var(--color-accent)] text-white">
                     {session.user?.name?.charAt(0).toUpperCase() ?? 'A'}
                   </AvatarFallback>
                 </Avatar>
               </div>
             )}
           />
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
