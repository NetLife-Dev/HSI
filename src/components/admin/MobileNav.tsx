'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

// Show only first 5 items in mobile nav (exclude Settings to save space)
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5)

export function MobileNav() {
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
                'flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300',
                isActive
                  ? 'text-accent scale-110 font-bold'
                  : 'text-white/40 hover:text-white'
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive ? "bg-accent/10 border border-accent/20" : ""
              )}>
                <Icon size={20} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

