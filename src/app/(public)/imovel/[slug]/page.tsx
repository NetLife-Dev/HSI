import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  BedDouble, 
  Bath, 
  MapPin,
  ChevronRight, 
  ShieldCheck, 
  Star 
} from 'lucide-react'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PropertyGallery } from '@/components/public/PropertyGallery'
import { PropertyBookingEngine } from '@/components/public/PropertyBookingEngine'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  let property: any = null
  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
    })
  } catch(e) {
    property = { name: "Vila Ocean View UX Demo", description: "Aproveite esta demo maravilhosa" }
  }

  if (!property) return { title: 'Imóvel não encontrado' }

  return {
    title: `${property.name} — Reserva Direta`,
    description: property.description?.substring(0, 160).replace(/<[^>]*>/g, ''),
  }
}

export default async function PropertyDetailsPage({ params }: any) {
  const { slug } = await params
  let property: any = null

  // 1. Definição dos Mocks de "Operação Real"
  const MOCK_PROPERTIES: Record<string, any> = {
    'villa-ocean-view': {
      id: "mock1", name: "Villa Ocean View", slug: "villa-ocean-view",
      locationAddress: "Praia do Forte, Bahia",
      maxGuests: 8, bedrooms: 4, bathrooms: 5,
      description: "<p>Uma joia arquitetônica debruçada sobre o mar. Esta villa oferece total privacidade com serviço de concierge 24h, piscina de borda infinita e acesso direto à praia privativa. Perfeita para famílias que buscam o ápice do conforto no Litoral Norte.</p>",
      images: [
        { id: "v1", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "v2", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "v3", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "v4", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
      ],
      basePrice: 150000, cleaningFee: 25000
    },
    'refugio-da-mata': {
      id: "mock2", name: "Refúgio da Mata", slug: "refugio-da-mata",
      locationAddress: "Trancoso, Bahia",
      maxGuests: 6, bedrooms: 3, bathrooms: 3,
      description: "<p>Experimente o Quadrado de Trancoso de uma forma rústica e sofisticada. Imersa na mata atlântica, esta casa de autor combina madeira de demolição com design contemporâneo e uma ventilação natural indescritível.</p>",
      images: [
        { id: "r1", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "r2", url: "https://images.unsplash.com/photo-1600607687931-cebf004f5605?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "r3", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
      ],
      basePrice: 220000, cleaningFee: 30000
    },
    'cobertura-skyline': {
      id: "mock3", name: "Cobertura Skyline", slug: "cobertura-skyline",
      locationAddress: "Jurerê Internacional, SC",
      maxGuests: 4, bedrooms: 2, bathrooms: 3,
      description: "<p>O ponto mais alto do luxo urbano em Florianópolis. Vista panorâmica completa da orla de Jurerê, jacuzzi privativa no terraço e automação residencial completa via iPad. Luxo técnico e visual para hóspedes exigentes.</p>",
      images: [
        { id: "s1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "s2", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
        { id: "s3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }
      ],
      basePrice: 350000, cleaningFee: 45000
    }
  }

  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
      with: {
        images: {
          orderBy: (images: any, { asc }: any) => [asc(images.order)],
        },
      },
    })
    
    // Se o banco retornar vazio (limpo), usa o mock
    if (!property) {
      property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
    }
  } catch(e) {
    console.log("Mock Mode Active for Property Details:", slug)
    property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
  }

  if (!property) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-300" />
          <Link href="/imoveis" className="hover:text-primary transition-colors">Imóveis</Link>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-slate-900 border-b border-primary pb-0.5">{property.name}</span>
        </div>

        {/* Gallery Section */}
        <PropertyGallery images={property.images} />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest shadow-sm">
                Vila de Luxo
              </Badge>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                4.9 <span className="text-slate-400 font-medium ml-1">(128 avaliações)</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[0.95]">
              {property.name}
            </h1>
            
            <div className="flex items-center gap-2 text-slate-500 font-semibold group cursor-pointer">
              <MapPin size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="hover:underline transition-all underline-offset-4">{property.locationAddress} — Ver no Mapa</span>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-6">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Users size={20} className="text-slate-900" />
                    <span className="text-2xl font-bold text-slate-900 leading-none">{property.maxGuests}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Hóspedes</span>
              </div>
              <div className="flex flex-col gap-1 pl-8 border-l border-slate-100">
                 <div className="flex items-center gap-3 text-slate-400">
                    <BedDouble size={20} className="text-slate-900" />
                    <span className="text-2xl font-bold text-slate-900 leading-none">{property.bedrooms}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Quartos</span>
              </div>
              <div className="flex flex-col gap-1 pl-8 border-l border-slate-100">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Bath size={20} className="text-slate-900" />
                    <span className="text-2xl font-bold text-slate-900 leading-none">{property.bathrooms}</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Banheiros</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-4 bg-slate-50 p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-[60px] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform opacity-30" />
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl mb-2">
                <ShieldCheck size={32} />
             </div>
             <p className="text-center text-xs font-bold uppercase tracking-widest leading-relaxed max-w-[150px]">
                Hospedagem <span className="text-primary">100% Auditada</span> pela NetLife
             </p>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Booking Engine & Content */}
        <PropertyBookingEngine property={property} />
      </div>
    </div>
  )
}
