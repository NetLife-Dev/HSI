import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const bookingRef = session_id
    ? `#HSI-${session_id.slice(-8).toUpperCase()}`
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="bg-[#111] rounded-[4rem] p-12 md:p-20 max-w-2xl w-full text-center space-y-10 border border-white/5 shadow-2xl shadow-accent/5 relative overflow-hidden transition-all">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto shadow-inner hover:scale-110 transition-transform duration-700 relative z-10">
          <CheckCircle2 size={48} className="animate-in zoom-in duration-500 delay-300" />
        </div>

        <div className="space-y-6 relative z-10">
          <h1 className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight leading-[0.9]">
            Sua Estadia está<br />Confirmada.
          </h1>
          <p className="text-lg text-white/50 leading-relaxed font-medium px-4">
            Nossa{' '}
            <span className="text-accent font-bold">Concierge VIP</span>{' '}
            entrará em contato via WhatsApp em alguns minutos para coordenar os detalhes finais do seu Check-in.
          </p>
        </div>

        {bookingRef && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-sm mx-auto relative z-10 group hover:border-accent/30 transition-colors">
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-3">
              Localizador da Reserva
            </p>
            <p className="text-3xl font-mono font-bold text-white tracking-tighter">{bookingRef}</p>
          </div>
        )}

        <div className="pt-8 relative z-10">
          <Link href="/">
            <Button className="h-16 px-12 rounded-2xl text-[10px] uppercase font-black tracking-[0.3em] bg-white text-black hover:bg-accent hover:scale-[1.02] transition-all shadow-2xl gap-4">
              Descobrir mais vilas
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
