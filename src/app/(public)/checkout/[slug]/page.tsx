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

  if (!checkin || !checkout) {
    // Should have dates selected
    return (
      <div className="min-h-screen pt-32 pb-24 text-center">
        <h1>Por favor, selecione as datas antes de reservar.</h1>
        <Link href={`/imovel/${slug}`} className="text-primary underline">Voltar para o imóvel</Link>
      </div>
    )
  }

  const checkinDate = parseISO(checkin as string)
  const checkoutDate = parseISO(checkout as string)
  const nights = differenceInDays(checkoutDate, checkinDate)

  // DB Fetch with Mock Fallback for UAT
  let property: any = null
  try {
    property = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
      with: {
        images: {
          orderBy: (images: any, { asc }: any) => [asc(images.order)],
        },
      },
    })
  } catch(e) {
    property = { 
      id: "mock123", name: "Vila Ocean View UX Demo", 
      locationAddress: "Litoral Praia do Forte, Bahia",
      maxGuests: 8, bedrooms: 4, bathrooms: 5,
      rules: "Proibido som alto após as 22h. Não permitimos pets de grande porte.",
      images: [
        { id: "1", url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" },
      ],
      basePrice: 125000,
      cleaningFee: 25000
    }
  }

  if (!property) {
    notFound()
  }

  const basePrice = property.basePrice || 85000
  const totalNightsPrice = nights * basePrice
  const cleaningFee = property.cleaningFee || 15000
  const totalPrice = totalNightsPrice + cleaningFee

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-12">
          <Link href={`/imovel/${slug}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6">
            <ChevronLeft size={16} /> Voltar para o imóvel
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
            Confirme sua Estadia
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Form and Details Area */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Guest Summary */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                 <Users size={24} className="text-primary" />
                 Seus Dados
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                  <Input placeholder="Como está no documento" className="h-14 bg-slate-50 border-slate-200 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">E-mail</label>
                  <Input type="email" placeholder="seu@email.com" className="h-14 bg-slate-50 border-slate-200 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">WhatsApp</label>
                  <Input placeholder="(11) 99999-9999" className="h-14 bg-slate-50 border-slate-200 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">CPF</label>
                  <Input placeholder="000.000.000-00" className="h-14 bg-slate-50 border-slate-200 rounded-2xl" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                  <label className="text-sm font-bold text-slate-700">Mensagem para o Proprietário (Opcional)</label>
                  <textarea 
                    placeholder="Diga olá e fale um pouco sobre o motivo da viagem..." 
                    className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
                  />
              </div>
            </section>

            {/* Rules */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
               <h2 className="text-xl font-bold">Lembretes Importantes</h2>
               <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 items-start">
                     <ShieldCheck size={24} className="text-amber-500 shrink-0" />
                     <p className="text-sm text-amber-900 leading-relaxed">
                        Requeremos documento de identidade oficial válido para todos os hóspedes antes do check-in por medidas de segurança.
                     </p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                     Ao prosseguir, você concorda em cumprir as regras da casa estabelecidas pelo proprietário: <span className="italic font-medium text-slate-700">{property.rules || 'Tratar o espaço com respeito e seguir os horários de silêncio.'}</span>
                  </p>
               </div>
            </section>
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-5 sticky top-32">
             <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                
                {/* Property Mini Header */}
                <div className="flex gap-4 items-center mb-8 pb-8 border-b border-white/10 relative z-10">
                   {property.images?.[0] && (
                     <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative border-[3px] border-white/10">
                       <img src={property.images[0].url} alt={property.name} className="w-full h-full object-cover" />
                     </div>
                   )}
                   <div className="space-y-1">
                      <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{property.locationAddress}</p>
                      <h3 className="font-bold text-xl leading-tight">{property.name}</h3>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pt-1">
                        <Star size={12} fill="currentColor" />
                        <span>4.9 Especial</span>
                      </div>
                   </div>
                </div>

                <h3 className="font-bold text-xl mb-6">Resumo dos Valores</h3>

                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{nights} {nights === 1 ? 'noite' : 'noites'}</span>
                      <span className="font-bold">{(totalNightsPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Limpeza Padrão</span>
                      <span className="font-bold">{(cleaningFee / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                </div>

                <Separator className="bg-white/10 mb-6" />

                <div className="flex justify-between items-end mb-10">
                   <div className="space-y-1">
                      <span className="text-xs uppercase font-bold tracking-widest text-primary">Total em BRL</span>
                      <p className="text-xs text-slate-400">Impostos inclusos</p>
                   </div>
                   <div className="text-3xl font-black text-white">
                      {(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </div>
                </div>

                <Link href="/checkout/sucesso" className="w-full">
                  <Button className="w-full h-16 rounded-2xl text-lg font-black tracking-widest uppercase bg-white text-black hover:bg-slate-200 hover:scale-[1.02] transition-transform shadow-xl">
                     Ir para Pagamento
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium mt-6">
                   <Lock size={12} />
                   Pagamento processado em ambiente seguro
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
