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
    <header className="h-20 bg-black flex items-center justify-between px-8 shrink-0 border-b border-white/5">
      {/* Left: page title placeholder (each page will provide its own via a context or Portal in later phases) */}
      <div className="text-sm font-black uppercase tracking-widest text-white/50">
        Painel de Gestão
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-6">
        <ThemeToggle />

        {/* Notification bell */}
         <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button 
                  {...props}
                  variant="ghost" 
                  size="icon" 
                  className="relative h-10 w-10 hover:bg-white/5 rounded-full" 
                  aria-label="Notificações"
                >
                  <Bell size={20} className="text-white" />
                  <Badge
                    variant="destructive"
                    className="absolute 0 top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-black pointer-events-none animate-pulse bg-accent text-black border-none"
                  >
                    3
                  </Badge>
                </Button>
              )}
            />
           <DropdownMenuContent align="end" className="w-[380px] p-0 bg-[#0a0a0a] border border-white/10 text-white rounded-2xl overflow-hidden shadow-2xl">
             <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black">
                 <p className="font-black text-sm uppercase tracking-widest text-white">Notificações</p>
                 <span className="text-[10px] text-accent font-black uppercase cursor-pointer hover:underline">Limpar Tudo</span>
             </div>
             <div className="max-h-[350px] overflow-y-auto">
                <div className="p-6 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                   <p className="text-sm font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest">Reserva Confirmada</p>
                   <p className="text-xs text-white/50 mt-2 font-medium">Fernando Silva fechou Refúgio da Mata por R$ 6.600.</p>
                   <p className="text-[10px] text-accent mt-3 font-bold uppercase tracking-widest">Há 5 min</p>
                </div>
                <div className="p-6 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                   <p className="text-sm font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest">Lead Pede Contato</p>
                   <p className="text-xs text-white/50 mt-2 font-medium">Marcela preencheu os dados, mas abandonou o Checkout.</p>
                   <p className="text-[10px] text-accent mt-3 font-bold uppercase tracking-widest">Há 20 min</p>
                </div>
                 <div className="p-6 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                    <p className="text-sm font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                      Atenção: Check-in Hoje
                    </p>
                    <p className="text-xs text-white/50 mt-2 font-medium">Jéssica fará o Check-in às 14:00 na Villa Ocean View.</p>
                    <p className="text-[10px] text-accent mt-3 font-bold uppercase tracking-widest">Há 2 horas</p>
                 </div>
             </div>
             <div className="p-4 bg-black text-center border-t border-white/5">
                 <button className="text-xs text-white/40 font-black uppercase tracking-widest hover:text-white transition-colors">Histórico Completo</button>
             </div>
           </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
         <DropdownMenu>
           <DropdownMenuTrigger
             render={(props) => (
               <div 
                 {...props}
                 className="h-10 w-10 rounded-full inline-flex items-center justify-center cursor-pointer overflow-hidden border border-white/10 hover:border-accent transition-colors"
               >
                 <Avatar className="h-full w-full rounded-none">
                   <AvatarImage src={session.user?.image ?? undefined} />
                   <AvatarFallback className="text-sm font-black bg-white text-black uppercase">
                     {session.user?.name?.charAt(0) ?? 'A'}
                   </AvatarFallback>
                 </Avatar>
               </div>
             )}
           />
          <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0a] border border-white/10 text-white rounded-2xl p-2 shadow-2xl">
            <div className="px-4 py-3 bg-black rounded-xl mb-2">
              <p className="text-sm font-black uppercase tracking-widest text-white">
                {session.user?.name ?? 'Admin'}
              </p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest truncate mt-1">
                {session.user?.email ?? ''}
              </p>
            </div>
            
            <DropdownMenuItem className="focus:bg-white/10 focus:text-white rounded-xl cursor-pointer p-3 text-xs font-bold uppercase tracking-widest">
              <User size={16} className="mr-3" />
              Perfil
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/5 my-2" />
            
            <DropdownMenuItem
              className="focus:bg-red-500/10 text-red-500 focus:text-red-500 rounded-xl cursor-pointer p-3 text-xs font-bold uppercase tracking-widest"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={16} className="mr-3" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
