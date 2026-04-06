import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Users, Home, MapPin, ShieldCheck, Lock, Star } from 'lucide-react'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export default async function CheckoutPage({ 
  params,
  searchParams 
}: { 
  params: any
  searchParams: any 
}) {
  const { slug } = await params
  const { checkin, checkout } = await searchParams

  const checkinDate = parseISO(checkin as string)
  const checkoutDate = parseISO(checkout as string)
  const nights = differenceInDays(checkoutDate, checkinDate)

  // 1. Definição dos Mocks de "Operação Real"
  const MOCK_PROPERTIES: Record<string, any> = {
    'villa-ocean-view': {
      id: "mock1", name: "Villa Ocean View", slug: "villa-ocean-view",
      locationAddress: "Praia do Forte, Bahia",
      maxGuests: 8, bedrooms: 4, bathrooms: 5,
      rules: "Proibido som alto após as 22h. Não permitimos festas sem autorização prévia.",
      images: [{ id: "v1", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }],
      basePrice: 150000, cleaningFee: 25000
    },
    'refugio-da-mata': {
      id: "mock2", name: "Refúgio da Mata", slug: "refugio-da-mata",
      locationAddress: "Trancoso, Bahia",
      maxGuests: 6, bedrooms: 3, bathrooms: 3,
      rules: "Respeite a fauna local. Coleta seletiva obrigatória. Proibido fumo interno.",
      images: [{ id: "r1", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }],
      basePrice: 220000, cleaningFee: 30000
    },
    'cobertura-skyline': {
      id: "mock3", name: "Cobertura Skyline", slug: "cobertura-skyline",
      locationAddress: "Jurerê Internacional, SC",
      maxGuests: 4, bedrooms: 2, bathrooms: 3,
      rules: "Uso da Jacuzzi apenas até as 22h. Proibido vidro na área da piscina do prédio.",
      images: [{ id: "s1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" }],
      basePrice: 350000, cleaningFee: 45000
    }
  }

  let property: any = null
  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
      with: {
        images: { limit: 1 },
      },
    })
    if (!property) property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
  } catch(e) {
    property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
  }

  if (!property) notFound()

  const basePrice = property.basePrice || 85000
  const totalNightsPrice = nights * basePrice
  const cleaningFee = property.cleaningFee || 15000
  const totalPrice = totalNightsPrice + cleaningFee

  return (
    <div className="bg-surface min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-12">
          <Link href={`/imovel/${slug}`} className="inline-flex items-center gap-2 text-text-tertiary hover:text-accent transition-colors font-bold text-sm mb-6 uppercase tracking-widest">
            <ChevronLeft size={16} /> Voltar para o imóvel
          </Link>
          <h1 className="text-4xl md:text-6xl font-display tracking-tight text-text-primary">
            Confirme sua Estadia
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Form and Details Area */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Guest Summary */}
            <section className="bg-surface-elevated rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm space-y-8">
              <h2 className="text-2xl font-display font-medium text-text-primary flex items-center gap-3">
                 <Users size={24} className="text-accent" />
                 Seus Dados
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">Nome Completo</label>
                  <Input placeholder="Como está no documento" className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">E-mail</label>
                  <Input type="email" placeholder="seu@email.com" className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">WhatsApp</label>
                  <Input placeholder="(11) 99999-9999" className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">CPF</label>
                  <Input placeholder="000.000.000-00" className="h-14 bg-surface border-border-subtle rounded-2xl focus-visible:ring-accent/20" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">Mensagem para o Proprietário (Opcional)</label>
                  <textarea 
                    placeholder="Diga olá e fale um pouco sobre o motivo da viagem..." 
                    className="w-full min-h-[120px] p-4 bg-surface border border-border-subtle rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" 
                  />
              </div>
            </section>

            {/* Rules */}
            <section className="bg-surface-elevated rounded-[2.5rem] p-8 md:p-10 border border-border-subtle shadow-sm space-y-6">
               <h2 className="text-xl font-display font-medium text-text-primary">Lembretes Importantes</h2>
               <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/10 items-start">
                     <ShieldCheck size={24} className="text-accent shrink-0" />
                     <p className="text-sm text-text-secondary leading-relaxed">
                        Requeremos documento de identidade oficial válido para todos os hóspedes antes do check-in por medidas de segurança.
                     </p>
                  </div>
                  <p className="text-sm text-text-tertiary leading-relaxed">
                     Ao prosseguir, você concorda em cumprir as regras da casa estabelecidas pelo proprietário: <span className="italic font-medium text-text-secondary">{property.rules || 'Tratar o espaço com respeito e seguir os horários de silêncio.'}</span>
                  </p>
               </div>
            </section>
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-5 sticky top-32">
             <div className="bg-text-primary text-background rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
                
                {/* Property Mini Header */}
                <div className="flex gap-4 items-center mb-8 pb-8 border-b border-white/10 relative z-10">
                   {property.images?.[0] && (
                     <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative border-[1px] border-white/10">
                       <img src={property.images[0].url} alt={property.name} className="w-full h-full object-cover" />
                     </div>
                   )}
                   <div className="space-y-1">
                      <p className="text-[10px] text-accent uppercase font-bold tracking-widest">{property.locationAddress}</p>
                      <h3 className="font-display font-medium text-xl leading-tight text-white">{property.name}</h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pt-1">
                        <Star size={12} fill="currentColor" />
                        <span>4.9 Unforgettable</span>
                      </div>
                   </div>
                </div>

                <h3 className="font-display text-xl mb-6 text-white/90">Resumo da Estadia</h3>

                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                      <span className="font-bold text-white">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-white/50">Taxa de Limpeza</span>
                      <span className="font-bold text-white">{(cleaningFee / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                </div>

                <Separator className="bg-white/10 mb-6" />

                <div className="flex justify-between items-end mb-10">
                   <div className="space-y-1">
                      <span className="text-xs uppercase font-bold tracking-widest text-accent">Investimento Total</span>
                      <p className="text-xs text-white/40 italic">Checkout Seguro</p>
                   </div>
                   <div className="text-3xl font-display font-medium text-white">
                      {(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </div>
                </div>

                <Link href="/checkout/sucesso" className="w-full">
                  <Button className="w-full h-16 rounded-2xl text-md font-bold tracking-widest uppercase bg-accent text-accent-foreground hover:bg-accent-hover hover:scale-[1.02] transition-transform shadow-xl border-0">
                     Confirmar e Pagar
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase font-bold tracking-widest mt-6">
                   <Lock size={10} />
                   Secure SSL Encryption
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
