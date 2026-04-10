import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — HostSemImposto',
  description: 'Entenda como coletamos, usamos e protegemos seus dados pessoais na plataforma HostSemImposto.',
}

export default function PrivacidadePage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="mb-12">
          <p className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-4">Documentação Legal</p>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">
            Política de <span className="text-accent">Privacidade</span>
          </h1>
          <p className="text-white/40 text-sm">Última atualização: abril de 2026 · Em conformidade com a LGPD (Lei 13.709/2018)</p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none space-y-10">

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">1. Quem é o Controlador</h2>
            <p className="text-white/60 leading-relaxed">
              O controlador dos dados pessoais coletados nesta plataforma é a <strong className="text-white">NetLife</strong>, com sede em Goiânia — GO, Brasil. Para contato com o Encarregado de Dados (DPO), utilize: <a href="mailto:privacidade@hostsemimposto.com" className="text-accent hover:underline">privacidade@hostsemimposto.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">2. Dados que Coletamos</h2>
            <p className="text-white/60 leading-relaxed mb-4">Coletamos apenas os dados necessários para a prestação dos serviços:</p>
            <div className="space-y-4">
              {[
                {
                  title: 'Dados de Cadastro',
                  items: ['Nome completo, e-mail, telefone (WhatsApp), CPF — para identificação e comunicação.'],
                },
                {
                  title: 'Dados de Reserva',
                  items: ['Datas de check-in e check-out, número de hóspedes, imóvel selecionado — para processamento da reserva.'],
                },
                {
                  title: 'Dados de Pagamento',
                  items: ['Processados exclusivamente via Stripe. Não armazenamos dados de cartão de crédito em nossos servidores.'],
                },
                {
                  title: 'Dados de Navegação',
                  items: ['Endereço IP, tipo de dispositivo, páginas acessadas — para segurança e melhoria da experiência.'],
                },
              ].map((section) => (
                <div key={section.title} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="font-black text-accent text-sm uppercase tracking-widest mb-2">{section.title}</h4>
                  {section.items.map((item, i) => (
                    <p key={i} className="text-white/60 text-sm leading-relaxed">{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">3. Finalidade do Tratamento</h2>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Processar e gerenciar reservas de hospedagem;',
                'Comunicar informações relevantes sobre reservas (confirmação, lembrete de check-in, etc.);',
                'Prevenir fraudes e garantir a segurança das transações;',
                'Cumprir obrigações legais e regulatórias;',
                'Melhorar continuamente os serviços da plataforma.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">4. Base Legal (LGPD)</h2>
            <p className="text-white/60 leading-relaxed">
              O tratamento de dados é realizado com base em: (i) execução de contrato (Art. 7º, V da LGPD), para o processamento de reservas; (ii) cumprimento de obrigação legal (Art. 7º, II) para obrigações fiscais; e (iii) legítimo interesse (Art. 7º, IX) para prevenção a fraudes e melhoria dos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">5. Compartilhamento de Dados</h2>
            <p className="text-white/60 leading-relaxed mb-4">Seus dados podem ser compartilhados com:</p>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Stripe Inc. — para processamento de pagamentos (sujeito à Política de Privacidade da Stripe);',
                'Resend — para envio de e-mails transacionais;',
                'Cloudinary — para armazenamento de imagens;',
                'Anfitriões parceiros — nome e contato, para viabilizar a hospedagem contratada;',
                'Autoridades competentes — quando exigido por lei.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="text-white/60 leading-relaxed mb-4">Como titular de dados, você tem direito a:</p>
            <ul className="text-white/60 space-y-2 list-none">
              {[
                'Confirmação da existência de tratamento dos seus dados;',
                'Acesso aos dados que possuímos sobre você;',
                'Correção de dados incompletos, inexatos ou desatualizados;',
                'Anonimização, bloqueio ou eliminação de dados desnecessários;',
                'Portabilidade dos dados para outro fornecedor de serviço;',
                'Revogação do consentimento, quando aplicável.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-accent font-black shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-white/60 leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato via <a href="mailto:privacidade@hostsemimposto.com" className="text-accent hover:underline">privacidade@hostsemimposto.com</a>. Atendemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">7. Retenção de Dados</h2>
            <p className="text-white/60 leading-relaxed">
              Mantemos seus dados pelo período necessário para cumprimento das finalidades declaradas e obrigações legais. Dados de reservas são retidos por até 5 anos para fins fiscais, conforme exigência legal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">8. Segurança</h2>
            <p className="text-white/60 leading-relaxed">
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui: criptografia em trânsito (TLS 1.3), autenticação segura, controle de acesso baseado em funções e monitoramento contínuo de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">9. Cookies</h2>
            <p className="text-white/60 leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento da plataforma (sessão de autenticação) e cookies de desempenho para análise de uso. Não utilizamos cookies de rastreamento de terceiros para fins publicitários.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="text-white/60 text-sm leading-relaxed">
              <strong className="text-white">Dúvidas?</strong> Entre em contato via{' '}
              <a href="mailto:privacidade@hostsemimposto.com" className="text-accent hover:underline">
                privacidade@hostsemimposto.com
              </a>{' '}
              ou WhatsApp{' '}
              <a href="https://wa.me/5562999944512" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                (62) 99994-4512
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
