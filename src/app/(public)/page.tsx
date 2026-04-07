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
    <div className="relative bg-background min-h-screen">
      {/* Cinematic Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-end pb-32 overflow-hidden">
        {/* Background Video/Image Layer */}
        <div className="absolute inset-0 w-full h-full">
           <Image
             src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=100"
             alt="Luxury Villa"
             fill
             priority
             className="object-cover scale-105 animate-[kenburns_30s_ease-in-out_infinite_alternate]"
           />
           {/* Gradient Overlay for Typography readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
           <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative container mx-auto px-6 lg:px-12 z-10 w-full">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12 w-full">
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-3xl">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-[2px] bg-accent" />
                   <span className="text-white uppercase tracking-[0.3em] font-light text-sm">Coleção Exclusiva</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-display text-white tracking-tight leading-[0.9]">
                  O Ápice da <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-200">
                    Sua Estadia.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-white/70 font-light max-w-xl leading-relaxed">
                  Um portfólio restrito de obras-primas arquitetônicas. Sem taxas de intermediários. Serviço de concierge sob demanda.
                </p>
                <div className="pt-4 flex flex-wrap gap-6">
                  <Link href="#colecao">
                     <Button className="rounded-full h-14 px-8 text-sm uppercase tracking-widest font-bold shadow-2xl shadow-accent/20 bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-105 transition-all group">
                        Ver a Coleção
                        <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </Link>
                  <Button variant="outline" className="rounded-full h-14 px-8 bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:text-white transition-all gap-3 uppercase tracking-widest text-sm font-bold">
                     <Play className="w-4 h-4" />
                     Vídeo Tour
                  </Button>
                </div>
             </div>

             {/* Right Floating Stats Box */}
             <div className="hidden lg:flex flex-col items-start gap-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
                <div className="space-y-2">
                   <p className="text-white/50 uppercase tracking-widest text-xs font-bold">Propriedades Selecionadas</p>
                   <p className="text-white text-5xl font-black">06</p>
                </div>
                <div className="w-full h-[1px] bg-white/10" />
                <div className="space-y-2">
                   <p className="text-white/50 uppercase tracking-widest text-xs font-bold">Reserva Direta</p>
                   <p className="text-accent text-xl font-display italic tracking-tight">Sem Taxas Ocultas</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* The Exclusive Collection */}
      <section id="colecao" className="py-32 bg-surface relative rounded-t-[3rem] -mt-10 z-20">
         <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-accent">
                     <Diamond size={16} />
                     <span className="uppercase tracking-[0.2em] font-bold text-sm">O Portfólio</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-display tracking-tight text-text-primary">
                     Propriedades <br /> Assinadas.
                  </h2>
               </div>
               <p className="text-slate-500 text-lg max-w-sm leading-relaxed pb-2">
                  Cada residência foi cuidadosamente curada para oferecer privacidade, design e uma experiência indescritível.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
               ))}
            </div>
         </div>
      </section>

      {/* Immersive CTA */}
      <section className="py-32 relative overflow-hidden bg-black text-white">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
         
         <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center space-y-10">
            <Sparkles className="w-16 h-16 text-primary mx-auto opacity-50" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl mx-auto leading-tight">
               Sua próxima narrativa começa aqui.
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
               Reserve diretamente com nossa equipe. Garantimos a melhor tarifa e um atendimento digno da sua exigência.
            </p>
            <div className="pt-8">
               <Button size="lg" className="rounded-full h-16 px-12 text-lg uppercase tracking-widest font-black shadow-2xl shadow-primary/20">
                  Falar com Consultor VIP
               </Button>
            </div>
         </div>
      </section>
    </div>
  )
}
