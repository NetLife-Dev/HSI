import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Calendar, User } from 'lucide-react'
import { getBlogPostBySlug } from '@/actions/blog'

const SEED_POSTS: Record<string, any> = {
  'lc-214-2025-o-que-e-impacto-no-aluguel-temporada': {
    id: 'seed-1',
    title: 'LC 214/2025: O que é e como impacta o aluguel por temporada no Brasil',
    excerpt: 'A Lei Complementar 214/2025, parte da Reforma Tributária brasileira, traz mudanças significativas para quem aluga imóveis pelo Airbnb e outras plataformas. Entenda o que muda e como se preparar.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-03-15'),
    status: 'published',
    content: `
<p>A <strong>Lei Complementar 214/2025</strong> é o principal instrumento legal da Reforma Tributária brasileira, aprovada para entrar gradualmente em vigor a partir de 2026. Para quem trabalha com aluguel por temporada — seja via Airbnb, Booking.com ou plataformas próprias — as mudanças são estruturais e exigem atenção imediata.</p>

<h2>O que muda na tributação?</h2>

<p>A LC 214/2025 institui dois novos tributos que substituirão o PIS, COFINS, IPI, ICMS e ISS:</p>

<ul>
  <li><strong>CBS (Contribuição sobre Bens e Serviços)</strong> — de competência federal, incide sobre a prestação de serviços, incluindo a locação por temporada;</li>
  <li><strong>IBS (Imposto sobre Bens e Serviços)</strong> — de competência estadual e municipal, com alíquota padrão que pode chegar a 26,5% sobre o valor do serviço prestado.</li>
</ul>

<h2>A locação por temporada é um serviço?</h2>

<p>Sim. E esse ponto é crucial. Diferentemente do aluguel residencial de longo prazo (imune ao ISS), o aluguel por temporada tem natureza de serviço de hospedagem quando acompanhado de serviços adicionais (limpeza, recepção, amenidades). A partir de 2026, plataformas como Airbnb são obrigadas a reter e recolher os novos tributos na fonte.</p>

<h2>O que isso significa na prática?</h2>

<p>Para o anfitrião que opera informalmente ou como pessoa física, o impacto pode ser significativo:</p>

<ul>
  <li>Retenção automática de CBS e IBS pelo marketplace (Airbnb, Booking);</li>
  <li>Necessidade de declaração de renda com a nova categorização tributária;</li>
  <li>Risco de bitributação para quem não estrutura corretamente sua operação.</li>
</ul>

<h2>Como se preparar?</h2>

<p>O caminho mais seguro é formalizar a operação como pessoa jurídica (MEI, ME ou LTDA), aproveitar os regimes diferenciados previstos na própria LC 214/2025 para prestadores de menor porte, e migrar parte das reservas para plataformas próprias — onde há mais controle sobre a incidência tributária.</p>

<p>A <strong>HostSemImposto</strong> existe exatamente para isso: dar ao anfitrião uma alternativa de reserva direta, com estrutura fiscal orientada para a nova realidade tributária brasileira.</p>
`,
  },
  'anfitrioes-airbnb-reforma-tributaria-guia-completo': {
    id: 'seed-2',
    title: 'Anfitriões do Airbnb e a Reforma Tributária: Guia Completo para 2026',
    excerpt: 'Com a chegada da CBS e do IBS, a tributação sobre aluguéis de temporada muda de patamar. Veja como a LC 214/2025 afeta sua operação e o que fazer para pagar menos imposto legalmente.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-03-22'),
    status: 'published',
    content: `
<p>Se você é anfitrião no Airbnb, 2026 marca um divisor de águas na sua operação. A <strong>Reforma Tributária</strong>, materializada pela LC 214/2025, redefine as regras do jogo para qualquer atividade de prestação de serviços no Brasil — e o aluguel por temporada está diretamente no centro dessa mudança.</p>

<h2>O que o Airbnb vai reter da sua receita?</h2>

<p>A partir da implementação plena do IBS e CBS, marketplaces internacionais como Airbnb passam a ter obrigação de recolher os novos tributos diretamente na fonte sobre os pagamentos feitos a anfitriões brasileiros. A alíquota estimada consolidada (CBS + IBS) pode representar entre 12% e 26% da receita bruta, dependendo do enquadramento do serviço.</p>

<h2>Pessoa Física vs. Pessoa Jurídica: qual a diferença?</h2>

<p>Para o anfitrião pessoa física, a renda de aluguel por temporada está sujeita ao IRPF (até 27,5%) e, com a reforma, à incidência das novas contribuições. Para a pessoa jurídica optante pelo Simples Nacional, a tributação pode ser significativamente menor, com alíquotas progressivas a partir de 6% sobre o faturamento, dependendo do anexo aplicável.</p>

<h2>Estratégias legais para 2026</h2>

<ul>
  <li><strong>Abertura de CNPJ:</strong> formalizar a operação como MEI (se o faturamento permitir) ou ME é o primeiro passo;</li>
  <li><strong>Separação de receitas:</strong> distinguir receita de locação pura (menos tributada) de receita de serviços (hospedagem, limpeza, concierge);</li>
  <li><strong>Reservas diretas:</strong> plataformas próprias reduzem a retenção obrigatória por marketplaces;</li>
  <li><strong>Planejamento tributário:</strong> consultar um contador especializado em hospitalidade para estruturar a operação corretamente.</li>
</ul>

<h2>O papel das plataformas de reserva direta</h2>

<p>Ao usar plataformas de reserva direta como a HostSemImposto, o anfitrião mantém controle total sobre o processo de cobrança, pode emitir NF diretamente ao hóspede e estrutura a tributação de forma mais eficiente — evitando a retenção automática dos marketplaces internacionais.</p>
`,
  },
  'como-regularizar-reduzir-impostos-anfitriao-temporada': {
    id: 'seed-3',
    title: 'Como se regularizar e reduzir impostos como anfitrião de temporada em 2026',
    excerpt: 'Existem formas legais de reduzir a carga tributária sobre sua renda de aluguel por temporada. Descubra as estratégias mais eficientes sob a nova legislação.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-03-29'),
    status: 'published',
    content: `
<p>A palavra "regularização" assusta muitos anfitriões. Mas a realidade é que operar dentro da lei pode ser — com planejamento correto — <strong>mais barato do que operar na informalidade</strong>. Especialmente após a LC 214/2025, a formalização passou a ser estratégia, não apenas cumprimento de obrigação.</p>

<h2>Passo 1: Entenda sua situação atual</h2>

<p>Antes de qualquer ação, você precisa saber:</p>
<ul>
  <li>Qual é seu faturamento anual com aluguel por temporada?</li>
  <li>Você já tem CNPJ? Em qual atividade?</li>
  <li>Quais plataformas usa para captação de reservas?</li>
  <li>Você emite NF para os hóspedes?</li>
</ul>

<h2>Passo 2: Escolha o enquadramento correto</h2>

<p>Para a maioria dos anfitriões com faturamento de até R$ 4,8 milhões/ano, o <strong>Simples Nacional</strong> é o regime mais vantajoso. Dentro do Simples, a atividade de hospedagem se enquadra geralmente no Anexo III ou IV, com alíquotas iniciais entre 6% e 10% sobre o faturamento.</p>

<p>Para volumes maiores, o <strong>Lucro Presumido</strong> pode ser mais eficiente, com presunção de lucro reduzida para atividades imobiliárias.</p>

<h2>Passo 3: Reduza a retenção nos marketplaces</h2>

<p>Anfitriões com CNPJ ativo e enquadramento no Simples Nacional podem solicitar às plataformas a redução ou eliminação da retenção de IR na fonte, apresentando a declaração de optante pelo Simples. Isso pode representar economia imediata de 1,5% a 5% sobre cada reserva.</p>

<h2>Passo 4: Diversifique seus canais de venda</h2>

<p>Reservas diretas — via WhatsApp, site próprio ou plataformas como a HostSemImposto — permitem que você fature integralmente, emita NF com a alíquota correta do seu enquadramento e mantenha relacionamento direto com o hóspede.</p>

<h2>Passo 5: Separe as receitas por natureza</h2>

<p>A locação do imóvel em si tem tratamento tributário diferente da prestação de serviços (concierge, limpeza, transfer). Estruturar contratos e cobranças de forma separada pode resultar em tributação menor sobre a parcela de locação pura.</p>
`,
  },
  'host-sem-imposto-solucao-anfitrioes-lc-214-2025': {
    id: 'seed-4',
    title: 'Host Sem Imposto: A solução para anfitriões na era da LC 214/2025',
    excerpt: 'Por que anfitriões inteligentes estão migrando para plataformas próprias? Entenda como o modelo da HostSemImposto reduz custos, aumenta controle e mantém você dentro da lei.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-04-05'),
    status: 'published',
    content: `
<p>O nome não é por acaso. A <strong>HostSemImposto</strong> surgiu de uma pergunta direta: como um anfitrião de temporada pode crescer de forma sustentável, sem ser esmagado por taxas de plataformas e pela nova carga tributária da LC 214/2025?</p>

<h2>O problema das grandes plataformas em 2026</h2>

<p>Com a Reforma Tributária em vigor, marketplaces como Airbnb e Booking.com passaram a ter responsabilidade pelo recolhimento de CBS e IBS sobre as transações dos anfitriões brasileiros. Na prática, isso significa:</p>

<ul>
  <li>Retenção automática de impostos antes do pagamento ao anfitrião;</li>
  <li>Comissão da plataforma de 12% a 20% sobre cada reserva;</li>
  <li>Dependência total das políticas e algoritmos de terceiros;</li>
  <li>Nenhum relacionamento direto com o hóspede.</li>
</ul>

<p>Some tudo isso e um anfitrião pode perder 30% a 40% de cada reserva antes de receber qualquer centavo.</p>

<h2>O modelo HostSemImposto</h2>

<p>A HostSemImposto opera como uma plataforma de reservas diretas. O anfitrião lista seu imóvel, configura os preços e o hóspede paga diretamente via Stripe — com NF emitida pelo próprio anfitrião sobre o valor real da transação.</p>

<p>As vantagens são concretas:</p>

<ul>
  <li><strong>Zero comissão de plataforma</strong> — o anfitrião recebe 100% do valor cobrado (menos taxas de processamento do Stripe, geralmente 1,8% a 3,4%);</li>
  <li><strong>Controle tributário real</strong> — o anfitrião emite NF com a alíquota correta do seu enquadramento no Simples ou Lucro Presumido;</li>
  <li><strong>Relacionamento direto</strong> — dados do hóspede, comunicação e fidelização ficam com o anfitrião;</li>
  <li><strong>Conformidade com a LC 214/2025</strong> — operação estruturada para a nova realidade tributária.</li>
</ul>

<h2>Para quem é a HostSemImposto?</h2>

<p>Para anfitriões que já têm demanda recorrente e querem reduzir dependência dos grandes marketplaces. Para gestores de imóveis que atendem clientes próprios e precisam de um sistema de reservas profissional. Para qualquer operador de hospedagem que quer crescer com inteligência fiscal.</p>

<h2>Comece agora</h2>

<p>Liste seu imóvel na HostSemImposto, configure seus preços e receba reservas diretas — com toda a estrutura técnica necessária para operar de forma profissional e em conformidade com a nova legislação tributária brasileira.</p>
`,
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = SEED_POSTS[slug]
  if (!post) return { title: 'Post não encontrado — HostSemImposto' }
  return {
    title: `${post.title} — Blog HostSemImposto`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let post: any = null
  try {
    post = await getBlogPostBySlug(slug)
  } catch {
    // DB not ready
  }

  if (!post) {
    post = SEED_POSTS[slug]
  }

  if (!post) notFound()

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors font-bold text-sm mb-10 uppercase tracking-widest">
          <ChevronLeft size={16} /> Voltar ao Blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Rascunho'}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={11} />
            {post.authorName}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight text-white mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-white/50 text-xl leading-relaxed mb-12 border-l-4 border-accent pl-6 italic">
            {post.excerpt}
          </p>
        )}

        <div className="w-full h-px bg-white/5 mb-12" />

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed
            prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
            prose-strong:text-white prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-ul:text-white/60 prose-li:marker:text-accent"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-white/40 text-sm mb-6">Gostou do conteúdo? Compartilhe com outros anfitriões.</p>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-accent font-bold text-sm uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
              <ChevronLeft size={14} /> Ver todos os artigos
            </Link>
            <a
              href="https://wa.me/5562999946552"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto px-6 py-3 rounded-2xl bg-accent text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-colors"
            >
              Falar com Especialista
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
