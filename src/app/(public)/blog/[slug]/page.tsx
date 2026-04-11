import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Calendar, User } from 'lucide-react'
import { getBlogPostBySlug } from '@/actions/blog'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
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
  } catch(e) {
    console.error(e)
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
