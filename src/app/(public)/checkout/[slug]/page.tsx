import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Star } from 'lucide-react'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { differenceInDays, parseISO } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CheckoutForm } from './CheckoutForm'
import { calculateBookingPrice } from '@/actions/bookings'

export default async function CheckoutPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string; services?: string }>
}) {
  const { slug } = await params
  const { checkin, checkout, guests, services } = await searchParams
  const guestsCount = Number(guests) || 1
  const selectedServiceIds = services?.split(',').filter(Boolean) ?? []

  const checkinDate = parseISO(checkin ?? '')
  const checkoutDate = parseISO(checkout ?? '')
  const nights = differenceInDays(checkoutDate, checkinDate)

  const MOCK_PROPERTIES: Record<string, any> = {
    'villa-ocean-view': {
      id: "mock1", name: "Villa Ocean View", slug: "villa-ocean-view",
      locationAddress: "Praia do Forte, Bahia",
      maxGuests: 8, bedrooms: 4, bathrooms: 5,
      rules: "Proibido som alto após as 22h. Não permitimos festas sem autorização prévia.",
      images: [{ id: "v1", url: "/images/mock/exterior.png" }],
      basePrice: 150000, cleaningFee: 25000,
      services: [
        { id: 's1', name: 'Aluguel de Jet Ski', description: 'Sea-Doo Spark por dia', price: 85000, unit: 'per_day' },
        { id: 's2', name: 'Faxina Extra', description: 'Limpeza completa durante a estadia', price: 15000, unit: 'total' }
      ]
    }
  }

  let property: any = null
  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
      with: {
        images: { limit: 1 },
        services: true,
        seasonalPricing: true,
      },
    })
    if (!property) property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
  } catch(e) {
    property = MOCK_PROPERTIES[slug] || MOCK_PROPERTIES['villa-ocean-view']
  }

  if (!property) notFound()

  // Use server-side calculateBookingPrice for consistency with what Stripe will charge
  let priceBreakdown: Awaited<ReturnType<typeof calculateBookingPrice>> | null = null
  const isRealProperty = property.id && !property.id.startsWith('mock')
  if (isRealProperty && checkin && checkout) {
    try {
      priceBreakdown = await calculateBookingPrice(property.id, checkin, checkout)
    } catch {
      // Fallback to simple calculation if breakdown fails
    }
  }

  const basePricePerNight = priceBreakdown ? priceBreakdown.pricePerNight : (property.basePrice || 85000)
  const totalNightsPrice = priceBreakdown ? priceBreakdown.totalNightsPrice : nights * basePricePerNight
  const cleaningFee = priceBreakdown ? priceBreakdown.cleaningFee : (property.cleaningFee || 15000)
  const priceDiscounts = priceBreakdown?.discounts ?? []

  const selectedServicesList = (property.services || []).filter((s: any) => selectedServiceIds.includes(s.id))
  const servicesTotal = selectedServicesList.reduce((acc: number, s: any) => {
    if (s.unit === 'per_day' || s.unit === 'per_night') return acc + (s.price * nights)
    if (s.unit === 'per_guest') return acc + (s.price * guestsCount)
    return acc + s.price
  }, 0)

  const totalPrice = totalNightsPrice + cleaningFee + servicesTotal

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-12">
          <Link href={`/imovel/${slug}`} className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors font-bold text-sm mb-6 uppercase tracking-widest">
            <ChevronLeft size={16} /> Voltar para o imóvel
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
            Confirme sua <span className="text-accent">Estadia</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Form and Details Area */}
          <div className="lg:col-span-7">
            <CheckoutForm 
              property={property}
              checkin={checkin as string}
              checkout={checkout as string}
              guests={guestsCount}
              selectedServiceIds={selectedServiceIds}
            />
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-5 sticky top-32">
             <div className="bg-[#111] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
                
                {/* Property Mini Header */}
                <div className="flex gap-4 items-center mb-8 pb-8 border-b border-white/5 relative z-10">
                   {property.images?.[0] && (
                     <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative border-[1px] border-white/10">
                       <Image src={property.images[0].url} alt={property.name} fill className="object-cover" sizes="96px" />
                     </div>
                   )}
                   <div className="space-y-1">
                      <p className="text-[10px] text-accent uppercase font-bold tracking-widest">{property.locationAddress}</p>
                      <h3 className="font-black uppercase tracking-tighter text-xl leading-tight text-white">{property.name}</h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pt-1">
                        <Star size={12} fill="currentColor" />
                        <span>4.9 Exclusivo</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40">{nights} {nights === 1 ? 'noite' : 'noites'} × {(basePricePerNight / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <span className="font-bold text-white">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                   {priceDiscounts.map((d, i) => (
                     <div key={i} className="flex justify-between items-center text-sm">
                       <span className="text-emerald-400/80">{d.name}</span>
                       <span className="font-bold text-emerald-400">-{(d.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                     </div>
                   ))}
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40">Taxa de Limpeza</span>
                      <span className="font-bold text-white">{(cleaningFee / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>

                   {servicesTotal > 0 && (
                      <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-accent/60">Serviços Adicionais</span>
                        {selectedServicesList.map((s: any) => (
                           <div key={s.id} className="flex justify-between items-center text-xs">
                             <span className="text-white/30">{s.name} {s.unit === 'per_day' || s.unit === 'per_night' ? `(${nights}x)` : s.unit === 'per_guest' ? `(${guestsCount}x)` : ''}</span>
                             <span className="font-medium text-white/60">
                               {(((s.unit === 'per_day' || s.unit === 'per_night') ? s.price * nights : s.unit === 'per_guest' ? s.price * guestsCount : s.price) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             </span>
                           </div>
                        ))}
                      </div>
                   )}
                </div>

                <div className="space-y-3 mb-6">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Cupom / Voucher</label>
                  <div className="flex gap-2">
                    <Input placeholder="Código promocional" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-12" />
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:text-black hover:bg-accent rounded-xl h-12 px-6 border font-bold text-[10px] uppercase tracking-widest">Aplicar</Button>
                  </div>
                </div>

                <Separator className="bg-white/5 mb-6" />

                <div className="flex justify-between items-end mb-10">
                   <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-accent">Total</span>
                      <p className="text-[9px] text-white/30 italic uppercase tracking-widest">Checkout Seguro</p>
                   </div>
                   <div className="text-4xl font-black text-white tracking-tighter">
                      {(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </div>
                </div>

                <div className="mt-8 p-4 rounded-2xl bg-accent/5 border border-accent/10 text-[10px] text-white/40 leading-relaxed italic text-center">
                   Ambiente de pagamento 128-bit SSL protegida por Stripe.
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
