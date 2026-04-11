import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, ShieldCheck, Sparkles, Diamond } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { PropertyCard } from '@/components/public/PropertyCard'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

export default async function HomePage() {
  let featuredProperties: any[] = []
  try {
    featuredProperties = await db.query.properties.findMany({
      where: and(eq(properties.status, 'active'), eq(properties.featured, true)),
      with: {
        images: {
          where: eq(properties.featured, true),
          limit: 1,
        },
      },
      limit: 6,
    })
  } catch (error) {
    console.log("Mock Mode Active for Featured Properties")
  }

  // Preenchendo com Mocks Luxuosos caso esteja vazio (modo UAT)
  if (featuredProperties.length === 0) {
    featuredProperties = MOCK_PROPERTIES.filter(p => p.featured)
  }

  return (
    <div className="relative bg-black text-white min-h-screen selection:bg-accent selection:text-black mt-[-4rem]">
      {/* 1. Primary Hero Section (Sticky) */}
      <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-0">
        <div className="absolute inset-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          >
            <source src="/images/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 lg:px-12 w-full h-full flex flex-col justify-end pb-32">
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
           </div>
        </div>
      </section>

      {/* 2. Transition/AfterHero Section (Overlay / Slides over Hero) */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden z-10 shadow-[0_-50px_100px_rgba(0,0,0,1)]">
         <div className="absolute inset-0 z-0">
            <video 
               autoPlay 
               muted 
               loop 
               playsInline 
               className="w-full h-full object-cover opacity-100"
            >
               <source src="/images/afterhero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
         </div>
         <div className="relative z-10 text-center space-y-4 px-6">
            <h3 className="text-5xl md:text-[8rem] font-black uppercase tracking-tighter text-white drop-shadow-2xl">
               O <span className="text-accent italic">Acesso.</span>
            </h3>
            <p className="text-accent uppercase tracking-[0.4em] font-black text-xs">A porta para o extraordinário está aberta.</p>
         </div>
      </section>

      {/* The Exclusive Collection (Continues the flow) */}
      <section id="colecao" className="py-32 bg-[#050505] relative z-20 pb-0 shadow-[0_-50px_100px_rgba(0,0,0,1)]">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col gap-6 mb-20 text-center items-center">
               <div className="w-1 h-12 bg-accent rounded-full" />
               <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                  O <span className="text-accent">Portfólio.</span>
               </h2>
               <p className="text-white/50 font-medium tracking-widest uppercase text-xs">
                  Sem intermediários. Sem regras ocultas.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
               ))}
            </div>
         </div>
      </section>

      {/* Individual Experience / Immersion Section (Optimized for performance) */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden flex items-center justify-center bg-black">
         <div className="absolute inset-0 z-0 opacity-40">
            <Image 
               src="/images/mock/bedroom.png"
               alt="Luxury Interior"
               fill
               className="object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black" />
         </div>
         
         <div className="relative z-10 container mx-auto px-6 text-center space-y-8">
            <div className="flex flex-col items-center gap-4">
                <span className="text-accent uppercase tracking-[0.5em] font-black text-[10px]">Imersão Total</span>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white">
                   Entre no seu<br /><span className="text-accent underline decoration-white/10 decoration-8 underline-offset-8 italic">Próprio Mundo.</span>
                </h2>
                <p className="text-lg text-white/40 max-w-2xl font-medium tracking-tight">
                   A experiência individual de cada propriedade é desenhada para ser sentida. Cada detalhe, uma descoberta.
                </p>
            </div>
         </div>
      </section>

      {/* Premium Concierge Services */}
      <section className="py-32 bg-black relative z-20 pb-0">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-1 bg-accent" />
                     <span className="text-accent uppercase tracking-[0.4em] font-black text-xs">Exigência</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                     Serviços <br /><span className="text-white/40">Sob Demanda.</span>
                  </h2>
                  <p className="text-xl text-white/50 leading-relaxed font-medium">
                     Serviços que podem ser oferecidos na sua residência para elevar a experiência de hospedagem ao nível máximo de exclusividade.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                     <div className="space-y-2">
                        <ShieldCheck size={32} className="text-accent" />
                        <h4 className="text-lg font-black uppercase tracking-widest mt-4">Segurança</h4>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Escoltas Privadas</p>
                     </div>
                     <div className="space-y-2">
                        <Diamond size={32} className="text-accent" />
                        <h4 className="text-lg font-black uppercase tracking-widest mt-4">Concierge</h4>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em]">Helicópteros e Iates</p>
                     </div>
                  </div>
               </div>
               
               <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden group shadow-2xl shadow-accent/10 border border-white/5">
                  <video 
                     autoPlay 
                     muted 
                     loop 
                     playsInline 
                     className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]"
                  >
                     <source src="/images/individual.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-accent/20 mix-blend-overlay pointer-events-none" />
               </div>
            </div>
         </div>
      </section>


      {/* Immersive CTA */}
      <section className="h-[70vh] min-h-[600px] relative overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0 z-0">
           <Image
             src="/images/mock/living.png"
             alt="Living Room"
             fill
             className="object-cover opacity-40 scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
         </div>
         
         <div className="container mx-auto px-6 relative z-10 text-center space-y-12">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white">
               A Noite <span className="text-accent">Começa</span><br />Aqui.
            </h2>
            <div className="pt-4 flex justify-center">
               <Button size="lg" className="h-20 px-16 text-xl uppercase tracking-widest font-black bg-white text-black hover:bg-accent hover:scale-110 transition-transform shadow-2xl">
                  Agendar Diretamente
               </Button>
            </div>
         </div>
      </section>
    </div>
  )
}
