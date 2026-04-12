import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { getBlogPosts } from '@/actions/blog'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog da Hospedagem — HostSemImposto',
  description: 'Dicas, novidades e análises sobre aluguel por temporada, legislação tributária e como maximizar seus resultados como anfitrião.',
}

export default async function BlogPage() {
  let dbPosts: any[] = []
  try {
    dbPosts = await getBlogPosts('published')
  } catch {
    // DB error
  }

  const posts = dbPosts || []

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="text-accent text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-4">Conteúdo & Conhecimento</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
            Blog da <span className="text-accent">Hospedagem</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl leading-relaxed">
            Análises, guias e estratégias para anfitriões de temporada que querem crescer com inteligência tributária e resultado real.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          {posts.map((post: any, i: number) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`group block rounded-[2.5rem] bg-[#111] border border-white/5 hover:border-accent/30 transition-all overflow-hidden ${i === 0 ? 'lg:col-span-2' : ''}`}
            >
              {post.coverImageUrl ? (
                <div className={cn("relative w-full overflow-hidden", i === 0 ? 'h-64 md:h-96' : 'h-56')}>
                  <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw" />
                </div>
              ) : (
                <div className={`w-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center ${i === 0 ? 'h-56 md:h-72' : 'h-48'}`}>
                  <span className="text-5xl font-black text-accent/20 uppercase tracking-tighter">HSI</span>
                </div>
              )}
              <div className="p-6 md:p-10">
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
                <h2 className={cn(
                  "font-black uppercase tracking-tighter leading-tight text-white group-hover:text-accent transition-colors mb-3",
                  i === 0 ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                )}>
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
