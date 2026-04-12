'use client'

import { motion } from 'framer-motion'
import { UtensilsCrossed, ShieldCheck, Car, Waves, ConciergeBell, Camera } from 'lucide-react'

const SERVICES = [
  {
    title: 'Chef em Casa',
    desc: 'Experiências gastronômicas personalizadas com os melhores chefs da região.',
    icon: UtensilsCrossed,
    color: 'from-orange-500/20 to-transparent'
  },
  {
    title: 'Segurança VIP',
    desc: 'Monitoramento 24h e suporte tático para total tranquilidade da sua família.',
    icon: ShieldCheck,
    color: 'from-blue-500/20 to-transparent'
  },
  {
    title: 'Transfer Privativo',
    desc: 'Frota de luxo para traslados aeroporto e passeios exclusivos.',
    icon: Car,
    color: 'from-accent/20 to-transparent'
  },
  {
    title: 'Wellness & Spa',
    desc: 'Massagens e tratamentos relaxantes na privacidade do seu santuário.',
    icon: Waves,
    color: 'from-emerald-500/20 to-transparent'
  },
  {
    title: 'Concierge 24/7',
    desc: 'Suporte total para reservas de passeios, iates e desejos especiais.',
    icon: ConciergeBell,
    color: 'from-purple-500/20 to-transparent'
  },
  {
    title: 'Editorial Photo',
    desc: 'Ensaio profissional para eternizar seus momentos mais exclusivos.',
    icon: Camera,
    color: 'from-rose-500/20 to-transparent'
  }
]

export const ServicesPremiumSection = () => {
  return (
    <section className="relative py-32 bg-[#050505] overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20 space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent uppercase tracking-[0.5em] font-black text-[10px]"
          >
            Além da Estadia
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white"
          >
            Serviços <span className="text-accent italic">Curados.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 font-medium max-w-2xl mx-auto"
          >
            Elevamos sua experiência com curadoria de serviços premium, desenhados para satisfazer os gostos mais exigentes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="relative group p-10 rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 overflow-hidden"
            >
              {/* Blur accent bg */}
              <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative z-10 space-y-6">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-all duration-500">
                    <service.icon size={32} />
                 </div>
                 
                 <div className="space-y-4">
                    <h4 className="text-2xl font-black uppercase tracking-tight text-white">{service.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed font-medium">
                      {service.desc}
                    </p>
                 </div>

                 <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                       Saiba Mais <span className="w-8 h-px bg-accent" />
                    </span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
