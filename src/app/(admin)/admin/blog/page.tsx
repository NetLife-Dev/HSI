import { BookOpen, AlertTriangle } from 'lucide-react'
import { getBlogPosts } from '@/actions/blog'
import { BlogClient } from './BlogClient'

export default async function BlogAdminPage() {
  let posts: any[] = []
  let dbError: string | null = null

  try {
    posts = await getBlogPosts('all')
  } catch (err: any) {
    console.error('[BlogAdminPage] DB error:', err?.message)
    if (err?.message?.includes('relation "blog_posts" does not exist') || err?.code === '42P01') {
      dbError = 'A tabela de blog não existe. Execute: pnpm db:migrate'
    } else {
      dbError = 'Erro ao carregar posts. Verifique a conexão com o banco de dados.'
    }
  }

  const serialized = posts.map(p => ({
    ...p,
    publishedAt: p.publishedAt instanceof Date ? p.publishedAt.toISOString() : p.publishedAt,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  }))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
          <BookOpen className="text-accent" />
          Blog <span className="text-white/40 font-medium">da Hospedagem</span>
        </h1>
        <p className="text-white/50 font-medium mt-1">Gerencie os artigos publicados no blog público.</p>
      </div>

      {dbError && (
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">{dbError}</p>
            <p className="text-xs mt-1 text-amber-400/70">
              Rode <code className="bg-black/30 px-1 py-0.5 rounded">pnpm db:migrate</code> no servidor para criar a tabela de blog.
            </p>
          </div>
        </div>
      )}

      <BlogClient initialPosts={serialized} />
    </div>
  )
}
