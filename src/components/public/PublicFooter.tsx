import Link from 'next/link'
import { Home, Mail, Phone, MapPin, Instagram, Youtube, Facebook, ArrowUpRight } from 'lucide-react'

export function PublicFooter() {
  const whatsappNumber = '5562999946552'
  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-10">
            <Link href="/" className="flex items-center gap-1 group">
               <span className="font-black text-3xl tracking-tighter leading-none text-white transition-transform group-hover:scale-95">Host</span>
               <span className="text-3xl tracking-tighter leading-none text-accent italic font-black">SI</span>
            </Link>
            
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-sm">
               Curadoria seletiva de santuários onde o luxo encontra a serenidade absoluta. Experiências imersivas em cada detalhe.
            </p>

            <div className="flex items-center gap-6">
               <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-accent hover:border-accent/30 transition-all"><Instagram size={20} /></a>
               <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-accent hover:border-accent/30 transition-all"><Youtube size={20} /></a>
               <a href="#" className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-accent hover:border-accent/30 transition-all"><Facebook size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-8">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent">Navegação</h4>
            <ul className="flex flex-col gap-5 text-sm font-bold tracking-tight text-white/30">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/imoveis" className="hover:text-white transition-colors">Santuários</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-8">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent">Legal</h4>
            <ul className="flex flex-col gap-5 text-sm font-bold tracking-tight text-white/30">
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-10">
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
               <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/50">Atendimento Direto</h4>
               <ul className="space-y-6">
                  <li className="group">
                     <a href={whatsappUrl} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                           <Phone size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] uppercase tracking-widest font-black text-white/20 mb-0.5">WhatsApp</p>
                           <span className="text-white font-black text-sm">(62) 99994-6552</span>
                        </div>
                     </a>
                  </li>
                  <li className="group">
                     <a href="mailto:contato@hostsemimposto.com" className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20 group-hover:bg-accent group-hover:text-black transition-all">
                           <Mail size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] uppercase tracking-widest font-black text-white/20 mb-0.5">E-mail</p>
                           <span className="text-white font-black text-sm">contato@hsi.com</span>
                        </div>
                     </a>
                  </li>
               </ul>
            </div>
          </div>

        </div>

        {/* Big Bottom Text */}
        <div className="mt-32 border-t border-white/5 pt-12 text-center md:text-left">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">
                 © 2026 HostSemImposto — Diretas sem taxas ocultas.
              </p>
              
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                 Dev by <span className="italic text-white">NetLife-Dev</span> <ArrowUpRight size={12} className="text-accent" />
              </div>
           </div>
        </div>

        {/* Watermark */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 opacity-[0.02] select-none pointer-events-none whitespace-nowrap">
           <span className="text-[25rem] font-black uppercase leading-none tracking-tighter">HOSTSI</span>
        </div>
      </div>
    </footer>
  )
}
