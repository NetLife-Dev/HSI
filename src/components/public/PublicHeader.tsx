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
          'fixed inset-0 z-[100] flex flex-col justify-center px-10 transition-all duration-500 md:hidden',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop for mobile menu */}
        <div
          className="absolute inset-0 bg-black/98 backdrop-blur-2xl"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Close Button Inside Menu */}
        <button 
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-accent transition-colors z-20"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={32} />
        </button>

        {/* Nav links */}
        <nav className="relative z-10 flex flex-col gap-2 max-w-xs mx-auto w-full">
          <div className="mb-12">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1">
              <span className="font-black text-3xl tracking-tighter leading-none text-white">Host</span>
              <span className="text-3xl tracking-tighter leading-none text-accent italic font-display font-semibold">SI</span>
            </Link>
          </div>
          
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
              className="text-4xl font-black uppercase tracking-tighter text-white/40 hover:text-white py-4 border-b border-white/5 transition-all hover:pl-2"
              style={{
                transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms',
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                opacity: mobileMenuOpen ? 1 : 0,
                transition: `transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms, opacity 500ms ease ${i * 50}ms, color 200ms`,
              }}
            >
              {item.label}
            </Link>
          ))}

          <Link href="/imoveis" onClick={() => setMobileMenuOpen(false)} className="mt-12">
            <Button className="w-full rounded-2xl h-16 bg-accent text-black hover:bg-white text-lg font-black uppercase tracking-widest shadow-xl shadow-accent/20 border-0">
              Reservar Agora
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
