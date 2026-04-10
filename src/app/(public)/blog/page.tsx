import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { getBlogPosts } from '@/actions/blog'

export const metadata: Metadata = {
  title: 'Blog da Hospedagem — HostSemImposto',
  description: 'Dicas, novidades e análises sobre aluguel por temporada, legislação tributária e como maximizar seus resultados como anfitrião.',
}

const SEED_POSTS = [
  {
    id: 'seed-1',
    slug: 'lc-214-2025-o-que-e-impacto-no-aluguel-temporada',
    title: 'LC 214/2025: O que é e como impacta o aluguel por temporada no Brasil',
    excerpt: 'A Lei Complementar 214/2025, parte da Reforma Tributária brasileira, traz mudanças significativas para quem aluga imóveis pelo Airbnb e outras plataformas. Entenda o que muda e como se preparar.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-03-15'),
    coverImageUrl: null,
    status: 'published',
  },
  {
    id: 'seed-2',
    slug: 'anfitrioes-airbnb-reforma-tributaria-guia-completo',
    title: 'Anfitriões do Airbnb e a Reforma Tributária: Guia Completo para 2026',
    excerpt: 'Com a chegada da CBS e do IBS, a tributação sobre aluguéis de temporada muda de patamar. Veja como a LC 214/2025 afeta sua operação e o que fazer para pagar menos imposto legalmente.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-03-22'),
    coverImageUrl: null,
    status: 'published',
  },
  {
    id: 'seed-3',
    slug: 'como-regularizar-reduzir-impostos-anfitriao-temporada',
    title: 'Como se regularizar e reduzir impostos como anfitrião de temporada em 2026',
    excerpt: 'Existem formas legais de reduzir a carga tributária sobre sua renda de aluguel por temporada. Descubra as estratégias mais eficientes sob a nova legislação e por que a pessoa jurídica pode ser sua melhor aliada.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-03-29'),
    coverImageUrl: null,
    status: 'published',
  },
  {
    id: 'seed-4',
    slug: 'host-sem-imposto-solucao-anfitrioes-lc-214-2025',
    title: 'Host Sem Imposto: A solução para anfitriões na era da LC 214/2025',
    excerpt: 'Por que anfitriões inteligentes estão migrando para plataformas próprias? Entenda como o modelo da HostSemImposto reduz custos, aumenta controle e mantém você dentro da lei na era da nova Reforma Tributária.',
    authorName: 'Equipe HostSemImposto',
    publishedAt: new Date('2026-04-05'),
    coverImageUrl: null,
    status: 'published',
  },
]

export default async function BlogPage() {
  let dbPosts: any[] = []
  try {
    dbPosts = await getBlogPosts('published')
  } catch {
    // DB not ready — use seed posts only
  }

  const posts = (dbPosts && dbPosts.length > 0) ? dbPosts : SEED_POSTS

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-accent text-xs font-black uppercase tracking-[0.3em] mb-4">Conteúdo & Conhecimento</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
            Blog da <span className="text-accent">Hospedagem</span>
          </h1>
          <p className="text-white/50 text-xl max-w-2xl leading-relaxed">
            Análises, guias e estratégias para anfitriões de temporada que querem crescer com inteligência tributária e resultado real.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post: any, i: number) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`group block rounded-[2.5rem] bg-[#111] border border-white/5 hover:border-accent/30 transition-all overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}
            >
              {post.coverImageUrl ? (
                <div className="relative h-56 w-full overflow-hidden">
                  <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              ) : (
                <div className={`w-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center ${i === 0 ? 'h-48' : 'h-32'}`}>
                  <span className="text-5xl font-black text-accent/20 uppercase tracking-tighter">HSI</span>
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Rascunho'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={11} />
                    {post.authorName}
                  </span>
                </div>
                <h2 className={`font-black uppercase tracking-tighter leading-tight text-white group-hover:text-accent transition-colors mb-3 ${i === 0 ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-white/50 leading-relaxed text-sm mb-6 line-clamp-3">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                  Ler artigo <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
