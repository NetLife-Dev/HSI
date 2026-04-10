import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso — HostSemImposto',
  description: 'Leia os Termos de Uso da plataforma HostSemImposto antes de utilizar nossos serviços.',
}

export default function TermosPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="mb-12">
          <p className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-4">Documentação Legal</p>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
            Termos de <span className="text-accent">Uso</span>
          </h1>
          <p className="text-white/40 text-sm">Última atualização: abril de 2026</p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-10">

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">1. Aceitação dos Termos</h2>
            <p className="text-white/60 leading-relaxed">
              Ao acessar ou utilizar a plataforma HostSemImposto, operada pela NetLife, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, solicita-se que não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">2. Descrição dos Serviços</h2>
            <p className="text-white/60 leading-relaxed">
              A HostSemImposto é uma plataforma digital de reservas diretas de imóveis para temporada. Atuamos como intermediário tecnológico entre anfitriões (proprietários ou gestores de imóveis) e hóspedes, facilitando a comunicação, reserva e pagamento, sem assumir responsabilidade pela prestação direta do serviço de hospedagem.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">3. Cadastro e Conta</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Para utilizar funcionalidades completas da plataforma, pode ser necessário criar uma conta. Você é responsável por:
            </p>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Fornecer informações verdadeiras, precisas e atualizadas;',
                'Manter a confidencialidade de suas credenciais de acesso;',
                'Notificar imediatamente a plataforma em caso de uso não autorizado da sua conta;',
                'Todos os atos realizados mediante o uso de suas credenciais.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">4. Reservas e Pagamentos</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Ao realizar uma reserva:
            </p>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Os pagamentos são processados via Stripe, uma plataforma de pagamentos certificada PCI-DSS;',
                'O valor total cobrado inclui diárias, taxas de limpeza e serviços adicionais selecionados;',
                'A reserva é confirmada somente após a confirmação do pagamento pelo processador;',
                'Cancelamentos estão sujeitos à política de cancelamento do anfitrião, informada na página do imóvel.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">5. Obrigações do Hóspede</h2>
            <p className="text-white/60 leading-relaxed mb-4">O hóspede compromete-se a:</p>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Respeitar as regras da casa estabelecidas pelo anfitrião;',
                'Zelar pela conservação do imóvel e de seus equipamentos;',
                'Não sublocar ou ceder o imóvel a terceiros não declarados na reserva;',
                'Apresentar documento de identidade válido quando solicitado;',
                'Responsabilizar-se por danos causados ao imóvel durante a estadia.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">6. Obrigações do Anfitrião</h2>
            <p className="text-white/60 leading-relaxed mb-4">O anfitrião compromete-se a:</p>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Fornecer informações precisas e verídicas sobre o imóvel;',
                'Manter o imóvel nas condições descritas no anúncio;',
                'Cumprir as obrigações fiscais decorrentes da atividade de locação por temporada, incluindo as disposições da LC 214/2025;',
                'Respeitar a privacidade e segurança dos hóspedes.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">7. Propriedade Intelectual</h2>
            <p className="text-white/60 leading-relaxed">
              Todo o conteúdo da plataforma — incluindo textos, imagens, logotipos, código-fonte e design — é propriedade da NetLife ou de seus licenciantes. É vedada a reprodução, distribuição ou modificação sem autorização expressa por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-white/60 leading-relaxed">
              A HostSemImposto não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso da plataforma, da relação entre anfitriões e hóspedes, ou de eventos fora de seu controle razoável.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">9. Modificações dos Termos</h2>
            <p className="text-white/60 leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações substanciais serão comunicadas com antecedência mínima de 15 dias por e-mail ou notificação na plataforma. O uso continuado após a vigência das alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">10. Foro e Legislação Aplicável</h2>
            <p className="text-white/60 leading-relaxed">
              Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de Goiânia — GO para dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="text-white/60 text-sm leading-relaxed">
              <strong className="text-white">Contato:</strong> Para dúvidas sobre estes Termos, entre em contato via{' '}
              <a href="mailto:contato@hostsemimposto.com" className="text-accent hover:underline">
                contato@hostsemimposto.com
              </a>{' '}
              ou WhatsApp{' '}
              <a href="https://wa.me/5562999946552" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                (62) 99994-6552
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
