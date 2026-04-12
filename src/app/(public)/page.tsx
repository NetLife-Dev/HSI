'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Star, Shield, Zap, Heart, Search } from 'lucide-react'

// Featured Properties Mock (Should fetch from DB in Phase 2)
const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/properties?featured=true')
        const data = await res.json()
        setProperties(data)
      } catch (err) {
        console.error('Error fetching featured properties:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-[4/5] bg-zinc-900 animate-pulse rounded-2xl" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {properties.map((prop) => (
        <motion.div 
          key={prop.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group cursor-pointer"
        >
          <Link href={`/imovel/${prop.slug}`}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6">
              <img 
                src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6199fbfd00?auto=format&fit=crop&q=80'} 
                alt={prop.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute top-6 left-6">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="text-white text-xs font-black uppercase tracking-widest">Premium</span>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium tracking-wide">{prop.locationAddress?.split(',')[0]}</span>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight mb-2">{prop.name}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-accent font-black">
                    R$ {(prop.basePrice / 100).toLocaleString('pt-BR')} <span className="text-white/60 text-[10px] ml-1 uppercase">/ noite</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    <span className="text-xs font-bold">5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

const HomePage = () => {
  return (
    <div className="relative bg-black text-white min-h-screen selection:bg-accent selection:text-black mt-[-4rem]">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          >
            <source src="/images/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
        </div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center px-4"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <div className="w-8 h-px bg-accent/50" />
              <span className="text-accent uppercase tracking-[1em] font-black text-[10px]">Exclusivo</span>
              <div className="w-8 h-px bg-accent/50" />
            </motion.div>
            <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.8] text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
              Sua <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 italic">
                Estadia.
              </span>
            </h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2"
          >
            <div className="w-px h-24 bg-gradient-to-b from-accent to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. AFTERHERO DISCOVERY SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/images/afterhero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center space-y-4 px-6"
        >
          <h3 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter text-white drop-shadow-2xl">
            O <span className="text-accent italic">Acesso.</span>
          </h3>
          <p className="text-accent uppercase tracking-[0.5em] font-black text-sm">A porta para o extraordinário está aberta.</p>
        </motion.div>
      </section>

      {/* 3. DYNAMIC PORTFOLIO COLLECTION */}
      <section className="relative py-24 bg-black">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div className="space-y-4 border-l-4 border-accent pl-8">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
                Nossos <br /> <span className="text-accent italic">Santuários</span>
              </h2>
              <p className="text-gray-400 font-medium tracking-wide max-w-md">
                Uma curadoria exclusiva de refúgios onde o luxo encontra a paz absoluta.
              </p>
            </div>
          </motion.div>

          <FeaturedProperties />
        </div>
      </section>

      {/* CTA / Footer Promo */}
      <section className="relative py-32 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Pronto para o Próximo <br /><span className="text-accent">Capítulo?</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">Garanta sua reserva nos destinos mais cobiçados do país com o suporte personalizado que você merece.</p>
            <Link 
              href="/imoveis"
              className="inline-flex items-center gap-4 bg-white text-black px-12 py-5 font-black uppercase tracking-widest hover:bg-accent transition-all duration-500 hover:scale-105 group"
            >
              Explorar Todos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
