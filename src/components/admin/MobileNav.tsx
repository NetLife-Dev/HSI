'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

// Show only first 4 items in mobile nav, then a Menu button
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 4)

interface MobileNavProps {
  onMenuClick?: () => void
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="flex h-16 items-center px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 px-1',
                isActive
                  ? 'text-accent scale-110 font-bold'
                  : 'text-white/40 hover:text-white'
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive ? "bg-accent/10 border border-accent/20" : ""
              )}>
                <Icon size={18} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 text-white/40 hover:text-white px-1"
        >
          <div className="p-2 rounded-xl">
            <Menu size={18} />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Menu</span>
        </button>
      </div>
    </nav>
  )
}


