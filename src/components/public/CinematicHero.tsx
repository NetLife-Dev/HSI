'use client'

import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Intensified transitions for a more dramatic GTA VI feel
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.5])
  
  const afterHeroOpacity = useTransform(scrollYProgress, [0.15, 0.5], [0, 1])
  const afterHeroScale = useTransform(scrollYProgress, [0.15, 1], [0.8, 1.2])
  
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -150])
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-black">
      {/* Sticky Video Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Initial Hero Video (Fade out + Zoom in) */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 w-full h-full z-10"
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          >
            <source src="/images/hero-video.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* After Hero Video (Zoom in effect as it appears) */}
        <motion.div 
          style={{ opacity: afterHeroOpacity, scale: afterHeroScale }}
          className="absolute inset-0 w-full h-full z-0"
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-90"
          >
            <source src="/images/afterhero.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-20" />
        <div className="absolute inset-0 bg-black/10 z-20" />

        {/* Hero Content */}
        <motion.div 
          style={{ y: textY, opacity: textOpacity }}
          className="relative container mx-auto px-6 lg:px-12 z-30 w-full h-full flex flex-col justify-end pb-32"
        >
           <div className="space-y-6 lg:w-2/3">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-1 bg-accent" />
                 <span className="text-accent uppercase tracking-[0.4em] font-black text-xs">Exclusivo</span>
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
                Sua <br />
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 not-italic"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic' }}
                >
                  Estadia.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/50 font-medium max-w-2xl leading-relaxed">
                Um mapa de possibilidades ilimitadas. Onde o topo do luxo encontra a discrição absoluta.
              </p>
              
              <div className="pt-8 flex flex-col sm:flex-row gap-6">
                <Link href="#colecao">
                   <Button className="w-full sm:w-auto h-16 px-12 text-lg uppercase tracking-widest font-black bg-accent text-black hover:bg-white hover:scale-105 transition-all shadow-2xl shadow-accent/20">
                      Explorar Mapa
                   </Button>
                </Link>
              </div>
           </div>
        </motion.div>

        {/* Transition Hint */}
        <motion.div 
          style={{ opacity: afterHeroOpacity }}
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-[1em] text-white/10 text-center px-4">
             EXPANSÃO
          </h2>
        </motion.div>
      </div>
    </section>
  )
}
