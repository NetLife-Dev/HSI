'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Grid, Maximize, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: any[] // to be typed properly
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [activeImage, setActiveImage] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="aspect-[21/9] w-full bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
        Nenhuma foto disponível
      </div>
    )
  }

  const featuredImages = images.slice(0, 5)

  return (
    <div className="relative group/gallery">
      {/* Grid Layout (Desktop) */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 aspect-[21/9] rounded-3xl overflow-hidden">
        <div className="col-span-2 row-span-2 relative border border-slate-100 cursor-pointer" onClick={() => setActiveImage(0)}>
          <Image
            src={images[0].url}
            alt="Foto principal"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
        {images.slice(1, 5).map((img, i) => (
          <div 
            key={img.id} 
            className="relative border border-slate-100 cursor-pointer"
            onClick={() => setActiveImage(i + 1)}
          >
            <Image
              src={img.url}
              alt={`Foto ${i + 1}`}
              fill
              className="object-cover hover:scale-110 transition-transform duration-700"
            />
          </div>
        ))}
        {images.length > 5 && (
          <Button 
            className="absolute bottom-6 right-6 rounded-full px-6 gap-2 shadow-2xl backdrop-blur-md bg-white/90 text-slate-900 border-0 hover:bg-white"
            onClick={() => setActiveImage(0)}
          >
            <Grid size={16} />
            Ver todas as {images.length} fotos
          </Button>
        )}
      </div>

      {/* Slide Layout (Mobile) */}
      <div className="md:hidden aspect-square relative rounded-2xl overflow-hidden shadow-xl">
        <Image
          src={images[0].url}
          alt="Foto principal"
          fill
          className="object-cover"
        />
        <Button className="absolute bottom-4 right-4 rounded-full bg-black/40 backdrop-blur-md text-[10px] uppercase font-black border-0">
          1 / {images.length}
        </Button>
      </div>

      {/* Lightbox / Modal */}
      {activeImage !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
           <div className="flex items-center justify-between p-6 text-white/50">
              <span className="text-sm font-medium tracking-widest uppercase">{activeImage + 1} / {images.length}</span>
              <button onClick={() => setActiveImage(null)} className="p-2 hover:text-white transition-colors">
                 <X size={32} />
              </button>
           </div>
           
           <div className="flex-grow flex items-center justify-center relative px-12">
              <button 
                className="absolute left-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                onClick={() => setActiveImage(prev => (prev! > 0 ? prev! - 1 : images.length - 1))}
              >
                <ChevronLeft size={32} />
              </button>

              <div className="relative w-full h-[70vh] max-w-6xl shadow-2xl rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src={images[activeImage].url}
                  alt="Galeria"
                  fill
                  className="object-contain"
                />
              </div>

              <button 
                className="absolute right-6 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                onClick={() => setActiveImage(prev => (prev! < images.length - 1 ? prev! + 1 : 0))}
              >
                <ChevronRight size={32} />
              </button>
           </div>

           <div className="p-12 hidden lg:flex items-center justify-center gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <div 
                  key={img.id} 
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                    activeImage === i ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                  onClick={() => setActiveImage(i)}
                >
                   <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  )
}
