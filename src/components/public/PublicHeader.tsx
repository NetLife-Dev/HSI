'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    // Enable dark aesthetic by default on strictly public pages
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b select-none',
        isScrolled || !isHome
          ? 'bg-black/80 backdrop-blur-md border-white/10 py-3'
          : 'bg-transparent border-transparent py-6'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 group">
          <span className="font-black text-2xl tracking-tighter leading-none text-white group-hover:text-white transition-colors">
            Host
          </span>
          <span
            className="text-2xl tracking-tighter leading-none text-accent italic"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            SI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-black uppercase tracking-widest text-white/70">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <Link href="/imoveis" className="hover:text-accent transition-colors">Santuários</Link>
          <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
          <Link href="/sobre" className="hover:text-accent transition-colors">Sobre Nós</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/imoveis">
            <Button size="sm" className="hidden sm:flex rounded-full px-8 py-5 bg-accent text-black hover:bg-white hover:scale-105 font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-accent/40 transition-all">
              Agendar Retiro
            </Button>
          </Link>
          
          <button 
            className="md:hidden p-2 text-white hover:text-accent transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — fullscreen overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 flex flex-col justify-center px-10 transition-all duration-500 md:hidden',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Nav links */}
        <nav className="relative z-10 flex flex-col gap-1 max-w-xs mx-auto w-full">
          {[
            { href: '/', label: 'Página Inicial' },
            { href: '/imoveis', label: 'Santuários' },
            { href: '/blog', label: 'Blog' },
            { href: '/sobre', label: 'Sobre Nós' },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl font-black uppercase tracking-tighter text-white/60 hover:text-white py-3 border-b border-white/5 transition-colors"
              style={{
                transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms',
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                opacity: mobileMenuOpen ? 1 : 0,
                transition: `transform 400ms ease ${i * 50}ms, opacity 400ms ease ${i * 50}ms, color 200ms`,
              }}
            >
              {item.label}
            </Link>
          ))}

          <Link href="/imoveis" onClick={() => setMobileMenuOpen(false)} className="mt-8">
            <Button className="w-full rounded-2xl h-14 bg-accent text-black hover:bg-white text-base font-black uppercase tracking-widest shadow-lg shadow-accent/20">
              Agendar Retiro
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
