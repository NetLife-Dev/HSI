import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="bg-surface-elevated rounded-[4rem] p-12 md:p-20 max-w-2xl w-full text-center space-y-10 border border-border-subtle shadow-2xl shadow-accent/5 relative overflow-hidden transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
        
        <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto shadow-inner group hover:scale-110 transition-transform duration-700">
           <CheckCircle2 size={48} className="animate-in zoom-in duration-500 delay-300" />
        </div>
        
        <div className="space-y-6">
           <h1 className="text-5xl md:text-7xl font-display font-medium text-text-primary tracking-tight leading-[0.9]">Sua Estadia está Confirmada!</h1>
           <p className="text-lg text-text-secondary leading-relaxed font-medium px-4">
             Nossa <span className="text-accent underline font-bold">Concierge VIP</span> entrará em contato via WhatsApp em alguns minutos para coordenar os detalhes finais do seu Check-in.
           </p>
        </div>

        <div className="bg-surface border border-border-subtle rounded-3xl p-8 text-center max-w-sm mx-auto shadow-sm relative group">
           <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
           <p className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary mb-3">Localizador da Reserva</p>
           <p className="text-3xl font-mono font-bold text-text-primary tracking-tighter">#NL-X84K9P</p>
        </div>

        <div className="pt-8">
           <Link href="/">
             <Button className="h-16 px-12 rounded-2xl text-[10px] uppercase font-black tracking-[0.3em] bg-text-primary text-background hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-2xl gap-4">
               Descobrir mais vilas
               <ArrowRight size={16} className="text-accent" />
             </Button>
           </Link>
        </div>
      </div>
    </div>
  )
}
