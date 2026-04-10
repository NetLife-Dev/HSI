import { Metadata } from 'next'
import { Shield, Target, Users, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Quem Somos — HostSemImposto',
  description: 'Conheça a história, missão e valores da HostSemImposto — a plataforma que conecta anfitriões e hóspedes de forma direta, justa e transparente.',
}

export default function SobrePage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Hero */}
        <div className="mb-20">
          <p className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-4">Nossa História</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">
            Quem <span className="text-accent">Somos</span>
          </h1>
          <p className="text-white/60 text-xl leading-relaxed max-w-2xl">
            A HostSemImposto nasceu de uma necessidade real: conectar anfitriões inteligentes a hóspedes exigentes, sem as taxas absurdas das grandes plataformas e com total transparência tributária.
          </p>
        </div>

        {/* Missão */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {[
            {
              icon: Target,
              title: 'Nossa Missão',
              text: 'Democratizar o aluguel por temporada de alto padrão no Brasil, oferecendo uma plataforma que respeita o anfitrião e encanta o hóspede — sem intermediários desnecessários.',
            },
            {
              icon: Shield,
              title: 'Nossos Valores',
              text: 'Transparência total em cada transação. Conformidade com a legislação brasileira, incluindo a LC 214/2025. Tecnologia a serviço das pessoas, não o contrário.',
            },
            {
              icon: Users,
              title: 'Para Quem Fazemos',
              text: 'Para anfitriões que valorizam sua propriedade e querem controle real sobre suas reservas. Para hóspedes que buscam experiências autênticas e relação direta com quem os recebe.',
            },
            {
              icon: Award,
              title: 'Nosso Diferencial',
              text: 'Somos a única plataforma focada em hospedagem de luxo que orienta anfitriões sobre a nova reforma tributária (LC 214/2025), ajudando a manter a operação 100% legal e eficiente.',
            },
          ].map((item) => (
            <div key={item.title} className="p-8 rounded-[2.5rem] bg-[#111] border border-white/5 hover:border-accent/30 transition-all">
              <item.icon size={32} className="text-accent mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-3">{item.title}</h3>
              <p className="text-white/50 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Equipe */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-accent rounded-full" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">Por Trás da Plataforma</h2>
          </div>
          <p className="text-white/60 leading-relaxed text-lg mb-6">
            A HostSemImposto é desenvolvida pela <strong className="text-white">NetLife</strong>, uma empresa goiana de tecnologia com foco em soluções digitais para o mercado imobiliário e de hospitalidade.
          </p>
          <p className="text-white/60 leading-relaxed text-lg mb-6">
            Com sede em Goiânia — GO, a NetLife combina expertise técnica com profundo conhecimento do mercado de aluguéis por temporada no Brasil Central, entendendo as particularidades fiscais, operacionais e culturais do setor.
          </p>
          <p className="text-white/60 leading-relaxed text-lg">
            Nossa equipe acompanha ativamente as mudanças legislativas, especialmente a <strong className="text-white">Lei Complementar 214/2025</strong>, para garantir que anfitriões parceiros sempre operem dentro da legalidade e com máxima eficiência tributária.
          </p>
        </div>

        {/* CTA */}
        <div className="p-10 rounded-[3rem] bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 text-center">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Faça Parte da Comunidade</h3>
          <p className="text-white/60 mb-8 text-lg">
            Seja um anfitrião parceiro ou um hóspede que valoriza experiências reais. Bem-vindo à HostSemImposto.
          </p>
          <a
            href="https://wa.me/5562999944512"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-black font-black uppercase tracking-widest hover:bg-white transition-colors"
          >
            Falar com a Equipe
          </a>
        </div>

      </div>
    </div>
  )
}
