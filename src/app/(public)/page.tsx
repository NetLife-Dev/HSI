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
    <div className="relative bg-black text-white min-h-screen selection:bg-accent selection:text-black">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden border-b-[20px] border-[#0a0a0a]">
        {/* Background Video Layer */}
        <div className="absolute inset-0 w-full h-full z-0">
           <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              preload="auto"
              className="w-full h-full object-cover opacity-80"
           >
              <source src="/images/hero-video.mp4" type="video/mp4" />
           </video>
           {/* Cinematic Gradient Overlays */}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-90" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-12 z-10 w-full h-full flex flex-col justify-end pb-32">
           <div className="space-y-6 lg:w-2/3 animate-slide-up">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-1 bg-accent" />
                 <span className="text-accent uppercase tracking-[0.4em] font-black text-xs">Exclusivo</span>
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
                Sua <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
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
        </div>
      </section>

      {/* The Exclusive Collection */}
      <section id="colecao" className="py-32 bg-[#050505] relative z-20 border-b-[20px] border-[#0a0a0a]">
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

      {/* Premium Concierge Services */}
      <section className="py-32 bg-black relative z-20 border-b-[20px] border-[#0a0a0a]">
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
                     De motoristas blindados a chefs renomados cozinhando na sua cozinha, não alugamos apenas patrimônio. Alugamos uma infraestrutura de suporte absoluto.
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
               
               <div className="relative aspect-square w-full rounded-[3rem] overflow-hidden group">
                  <Image 
                     src="/images/mock/bedroom.png" 
                     className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s]" 
                     alt="Premium Service" 
                     fill
                  />
                  <div className="absolute inset-0 bg-accent/20 mix-blend-overlay" />
               </div>
            </div>
         </div>
      </section>

      {/* Promotional Seasons & Availability React Effects */}
      <section className="py-32 bg-[#050505] relative z-20 border-b-[20px] border-[#0a0a0a]">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="w-1 h-8 bg-accent rounded-full" />
                     <span className="text-white uppercase tracking-[0.2em] font-black">Datas Limitadas</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-white">
                    Temporadas <br /><span className="text-accent">Especiais.</span>
                  </h2>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { title: "Verão Exclusivo", date: "Jan - Fev", status: "Esgotando", color: "bg-red-500" },
                  { title: "Retiro de Inverno", date: "Julho", status: "Reservas Abertas", color: "bg-emerald-500" },
                  { title: "Réveillon VIP", date: "Dezembro", status: "Lista de Espera", color: "bg-amber-500" }
               ].map((season, i) => (
                  <div key={i} className="group relative bg-[#111] p-10 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-accent transition-all duration-500">
                     <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                        <Sparkles size={120} className="text-accent" />
                     </div>
                     <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{season.date}</span>
                           <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full animate-pulse ${season.color}`} />
                              <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{season.status}</span>
                           </div>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{season.title}</h3>
                        <Button variant="outline" className="w-full mt-4 bg-transparent border border-white/10 text-white hover:bg-accent hover:text-black hover:border-accent uppercase font-black tracking-widest">
                           Verificar Vagas
                        </Button>
                     </div>
                  </div>
               ))}
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
