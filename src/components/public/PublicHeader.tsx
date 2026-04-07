'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, X, Smartphone } from 'lucide-react'
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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-black shadow-lg shadow-accent/20 group-hover:bg-white transition-all">
            <Home size={24} />
          </div>
          <div className="flex flex-col text-white">
            <span className="font-black text-2xl tracking-tighter leading-none group-hover:text-accent transition-colors">
              HostSemImposto
            </span>
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white/50">
              Reserva Direta
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-black uppercase tracking-widest text-white/70">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <Link href="/imoveis" className="hover:text-accent transition-colors">Santuários</Link>
          <Link href="/sobre" className="hover:text-accent transition-colors">Sobre Nós</Link>
          <Link href="/contato" className="hover:text-accent transition-colors">Contato</Link>
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#050505] border-b border-white/5 shadow-2xl px-6 py-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <Link 
            href="/" 
            className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accent border-b border-white/5 pb-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Página Inicial
          </Link>
          <Link 
            href="/imoveis" 
            className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accent border-b border-white/5 pb-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Nossos Santuários
          </Link>
          <Link 
            href="/sobre" 
            className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accent border-b border-white/5 pb-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Quem Somos
          </Link>
          <Link 
            href="/contato" 
            className="text-2xl font-black uppercase tracking-tighter text-white hover:text-accent border-b border-white/5 pb-4"
            onClick={() => setMobileMenuOpen(false)}
          >
            Fale Conosco
          </Link>
          <Link href="/imoveis" className="w-full mt-4">
            <Button className="w-full rounded-2xl py-8 bg-accent text-black hover:bg-white text-xl font-black uppercase tracking-widest">
              Ver Disponibilidade
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
