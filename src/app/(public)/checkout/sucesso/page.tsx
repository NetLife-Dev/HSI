import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full text-center space-y-8 shadow-2xl shadow-slate-200">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
           <CheckCircle2 size={48} />
        </div>
        
        <div className="space-y-4">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reserva Confirmada!</h1>
           <p className="text-lg text-slate-500 leading-relaxed font-medium px-4">
             Sua reserva foi garantida com sucesso. Nossa concierge VIP entrará em contato via WhatsApp em alguns minutos para tratar dos detalhes do seu Check-in.
           </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left max-w-sm mx-auto">
           <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Código da Reserva</p>
           <p className="text-xl font-mono font-bold text-slate-900">#NL-X84K9P</p>
        </div>

        <div className="pt-8">
           <Link href="/">
             <Button className="rounded-full h-14 px-10 text-sm font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-transform gap-3">
               Voltar ao Início
               <ArrowRight size={16} />
             </Button>
           </Link>
        </div>
      </div>
    </div>
  )
}
