'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Star, Shield, Zap, Heart, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

// Featured Properties Collection
const FeaturedProperties = () => {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Corrected API URL
        const res = await fetch('/api/properties/featured')
        const data = await res.json()
        if (data.success) {
          setProperties(data.properties)
        }
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

  if (!properties || properties.length === 0) return (
    <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5">
      <p className="text-gray-500 font-medium">Nenhum imóvel disponível no momento.</p>
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
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use scroll for the portal effect on "Estadia"
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Ranges for transformations
  const desktopZoomRange = [0, 0.4]
  const mobileZoomRange = [0, 0.15]
  
  // 1. SCALES
  const estadiaScale = useTransform(scrollYProgress, isMobile ? mobileZoomRange : desktopZoomRange, [1, isMobile ? 1.1 : 2.5])
  const videoScale = useTransform(scrollYProgress, isMobile ? mobileZoomRange : desktopZoomRange, [1, isMobile ? 1 : 1.3])
  
  // 2. OPACITIES
  const suaOpacity = useTransform(scrollYProgress, [0, isMobile ? 0.05 : 0.1], [1, 0])
  const estadiaOpacity = useTransform(scrollYProgress, isMobile ? [0, 0.1] : [0.3, 0.4], [1, 0])
  
  // 3. Y-AXIS MOTION (DIFFERENT DIRECTIONS)
  // Mobile goes UP, Desktop goes DOWN for Estadia
  const suaY = useTransform(scrollYProgress, [0, 0.1], [0, isMobile ? -40 : 0])
  const estadiaY = useTransform(scrollYProgress, isMobile ? [0, 0.1] : [0, 0.4], [0, isMobile ? -60 : 150])

  return (
    <div className="relative bg-black text-white min-h-screen selection:bg-accent selection:text-black mt-[-4rem]">
      
      {/* 1. CINEMATIC HERO SECTION (SCROLL ZOOM PORTAL) */}
      <div ref={containerRef} className={cn("relative", isMobile ? "h-[120vh]" : "h-[300vh]")}>
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Background Video */}
          <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-0 will-change-transform">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover opacity-80"
            >
              <source src="/images/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black" />
          </motion.div>

          {/* Centered Portal Text */}
          <div className="relative z-10 text-center px-4 pointer-events-none">
            <motion.div 
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="space-y-1 flex flex-col items-center"
            >
               <motion.div style={{ opacity: suaOpacity, y: suaY }} className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <div className="w-5 h-px bg-accent/30" />
                     <span className="text-accent uppercase tracking-[1em] font-black text-[8px]">Exclusivo</span>
                     <div className="w-5 h-px bg-accent/30" />
                  </div>
                  
                  {/* "Sua" - Balanced */}
                  <span className="text-white text-xl md:text-2xl font-black uppercase tracking-widest block">
                     Sua
                  </span>
               </motion.div>

               {/* "Estadia" - The Portal Zoom */}
               <motion.div 
                  style={{ 
                    scale: estadiaScale, 
                    opacity: estadiaOpacity,
                    y: estadiaY
                  }}
                  className="will-change-transform"
               >
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                     <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 italic">
                        Estadia.
                     </span>
                  </h1>
               </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-accent/60">Scroll para explorar</span>
            <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* 2. AFTERHERO DISCOVERY SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center border-t border-white/5">
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
          {/* Enhanced Vignette overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
          <div className="absolute inset-0 bg-black/20" /> 
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center space-y-4 px-6"
        >
          <h3 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
            O <span className="text-accent italic">Acesso.</span>
          </h3>
          <p className="text-accent uppercase tracking-[0.5em] font-black text-xs md:text-sm drop-shadow-lg">A porta para o extraordinário está aberta.</p>
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
              <h2 id="nossos-santuarios" className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
                Nossos <br /> <span className="text-accent italic">Santuários</span>
              </h2>
              <p className="text-gray-400 font-medium tracking-wide max-w-md">
                Uma curadoria exclusiva de refúgios onde o luxo encontra a paz absoluta.
              </p>
            </div>
            
            <Link 
              href="/imoveis" 
              className="text-xs font-black uppercase tracking-widest text-accent hover:text-white transition-colors flex items-center gap-2 group"
            >
              Ver Catálogo Completo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <FeaturedProperties />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-32 overflow-hidden bg-zinc-950">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Pronto para o Próximo <br /><span className="text-accent">Capítulo?</span></h2>
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
