import Link from 'next/link'
import { Home, Mail, Phone, MapPin } from 'lucide-react'

export function PublicFooter() {
  const whatsappNumber = '5562999944512'
  const whatsappUrl = `https://wa.me/${whatsappNumber}`

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-md transition-transform group-hover:scale-105">
              <Home size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight">HostSemImposto</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed pr-4">
            A plataforma líder para reservas diretas de aluguéis de temporada de luxo. Melhores preços, sem taxas ocultas, atendimento direto com o anfitrião.
          </p>
        </div>

        {/* Explore */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Explorar</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
            <li><Link href="/" className="hover:text-primary hover:underline">Página Inicial</Link></li>
            <li><Link href="/imoveis" className="hover:text-primary hover:underline">Todos os Imóveis</Link></li>
            <li><Link href="/blog" className="hover:text-primary hover:underline">Blog da Hospedagem</Link></li>
            <li><Link href="/ajuda" className="hover:text-primary hover:underline">Central de Ajuda</Link></li>
          </ul>
        </div>

        {/* Institutional */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Institucional</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
            <li><Link href="/sobre" className="hover:text-primary hover:underline">Quem Somos</Link></li>
            <li><Link href="/termos" className="hover:text-primary hover:underline">Termos de Uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-primary hover:underline">Política de Privacidade</Link></li>
            <li><Link href="/blog" className="hover:text-primary hover:underline">Blog da Hospedagem</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400">Contato</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-3">
              <Phone size={14} className="text-primary shrink-0" />
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                (62) 99994-4512
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={14} className="text-primary shrink-0" />
              <span>contato@hostsemimposto.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={14} className="text-primary shrink-0" />
              <span className="leading-tight">Goiânia, Brasil</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
        <p>© 2026 HostSemImposto. Todos os direitos reservados.</p>
        <div className="flex items-center gap-1">
          Desenvolvido com <span className="text-destructive">❤</span> por{' '}
          <a
            href="https://www.devnetlife.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 dark:text-slate-100 italic hover:text-primary transition-colors"
          >
            NetLife
          </a>
        </div>
      </div>
    </footer>
  )
}
