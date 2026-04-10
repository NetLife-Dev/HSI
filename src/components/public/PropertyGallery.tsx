'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Grid, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: any[]
}

export function PropertyGallery({ images = [] }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="aspect-[21/9] w-full bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300">
        Nenhuma foto disponível
      </div>
    )
  }

  return (
    <div className="relative group/gallery animate-slide-up">
      {/* Grid Layout (Desktop) */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-4 aspect-[21/7] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div 
          className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden border border-slate-100/10 transition-transform duration-500 hover:scale-[1.02]"
          onClick={() => setActiveImage(0)}
        >
          <Image
            src={images[0].url}
            alt="Foto principal"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        
        {images.slice(1, 5).map((img, i) => (
          <div 
            key={img.id} 
            className="relative cursor-pointer group overflow-hidden border border-slate-100/10 transition-transform duration-300 hover:scale-[1.05]"
            onClick={() => setActiveImage(i + 1)}
          >
            <Image
              src={img.url}
              alt={`Foto ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-125"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>
        ))}

        <Button 
          className="absolute bottom-10 right-10 rounded-full px-8 h-12 gap-3 shadow-2xl backdrop-blur-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all font-bold text-xs uppercase tracking-widest"
          onClick={() => setActiveImage(0)}
        >
          <Grid size={18} />
          Galeria Completa ({images.length})
        </Button>
      </div>

      {/* Slide Layout (Mobile) */}
      <div className="md:hidden aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-2xl">
        <Image
          src={images[0].url}
          alt="Foto principal"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl text-white text-[10px] uppercase font-black border border-white/10 shadow-xl">
          1 / {images.length}
        </div>
      </div>

      {/* Lightbox / Modal with Native Animations */}
      {activeImage !== null && (
        <div className="fixed inset-0 z-[100] bg-[#0A0D14] flex flex-col pt-4 overflow-hidden animate-cinematic-zoom">
           {/* Dynamic Blur Background */}
           <div className="absolute inset-0 -z-10 blur-[120px] opacity-20 scale-150">
              <Image src={images[activeImage].url} alt="Blur" fill className="object-cover" />
           </div>

           <div className="flex items-center justify-between px-8 py-4 text-white/50 z-10">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">Detalhamento Visual</span>
                 <span className="text-sm font-bold tracking-widest text-white">{activeImage + 1} &mdash; {images.length}</span>
              </div>
              <button 
                 onClick={() => setActiveImage(null)} 
                 className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
              >
                 <X size={24} />
              </button>
           </div>
           
           <div className="flex-grow flex items-center justify-center relative px-4 md:px-24">
              <button 
                className="hidden md:flex absolute left-8 w-16 h-16 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-all border border-white/5"
                onClick={() => setActiveImage(prev => (prev! > 0 ? prev! - 1 : images.length - 1))}
              >
                <ChevronLeft size={32} />
              </button>

              <div className="relative w-full h-[60vh] md:h-[75vh] max-w-7xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem] overflow-hidden border border-white/5 transition-all duration-700">
                <Image
                  src={images[activeImage].url}
                  alt="Galeria"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <button 
                className="hidden md:flex absolute right-8 w-16 h-16 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 transition-all border border-white/5"
                onClick={() => setActiveImage(prev => (prev! < images.length - 1 ? prev! + 1 : 0))}
              >
                <ChevronRight size={32} />
              </button>
           </div>

           <div className="p-12 hidden lg:flex items-center justify-center gap-4">
              {images.map((img, i) => (
                <div 
                  key={img.id} 
                  className={cn(
                    "relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-0.5 hover:-translate-y-1.5",
                    activeImage === i 
                      ? "border-primary scale-110 shadow-[0_0_30px_rgba(255,204,0,0.3)]" 
                      : "border-transparent opacity-30 hover:opacity-100"
                    )}
                  onClick={() => setActiveImage(i)}
                >
                   <Image src={img.url} alt="Thumbnail" fill className="object-cover rounded-[1.1rem]" />
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  )
}
