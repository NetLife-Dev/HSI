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
    // Force light mode on public routes to avoid admin dark mode bleeding
    document.documentElement.classList.remove('dark')
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b',
        isScrolled || !isHome
          ? 'bg-background/80 backdrop-blur-md border-border py-3'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
            <Home size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight leading-none">
              HostSemImposto
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Reserva Direta
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/imoveis" className="hover:text-primary transition-colors">Imóveis</Link>
          <Link href="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
          <Link href="/contato" className="hover:text-primary transition-colors">Contato</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/imoveis">
            <Button size="sm" className="hidden sm:flex rounded-full px-6 shadow-md hover:shadow-primary/20">
              Reservar Agora
            </Button>
          </Link>
          
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b shadow-xl px-4 py-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
          <Link 
            href="/" 
            className="text-lg font-semibold border-b pb-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Página Inicial
          </Link>
          <Link 
            href="/imoveis" 
            className="text-lg font-semibold border-b pb-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Nossos Imóveis
          </Link>
          <Link 
            href="/sobre" 
            className="text-lg font-semibold border-b pb-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Quem Somos
          </Link>
          <Link 
            href="/contato" 
            className="text-lg font-semibold border-b pb-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Fale Conosco
          </Link>
          <Link href="/imoveis" className="w-full">
            <Button className="w-full rounded-xl py-6 text-lg tracking-tight">
              Ver Disponibilidade
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
