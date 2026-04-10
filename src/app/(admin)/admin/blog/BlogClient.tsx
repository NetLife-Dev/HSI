'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Eye, Search, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/actions/blog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  authorName: string
  status: string
  publishedAt?: string | null
  createdAt?: string | null
}

interface BlogClientProps {
  initialPosts: Post[]
}

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  authorName: 'HostSemImposto',
  status: 'draft' as 'draft' | 'published',
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingPost(null)
    setForm(EMPTY_FORM)
    setIsFormOpen(true)
  }

  const openEdit = (post: Post) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      authorName: post.authorName,
      status: post.status as 'draft' | 'published',
    })
    setIsFormOpen(true)
  }

  const handleTitleChange = (title: string) => {
    setForm(f => ({
      ...f,
      title,
      slug: editingPost ? f.slug : slugify(title),
    }))
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast.error('Título, slug e conteúdo são obrigatórios.')
      return
    }

    startTransition(async () => {
      try {
        if (editingPost) {
          const res = await updateBlogPost(editingPost.id, form)
          if (!res.success) { toast.error(res.error || 'Erro ao salvar'); return }
          setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...form } as Post : p))
          toast.success('Post atualizado!')
        } else {
          const res = await createBlogPost(form)
          if (!res.success) { toast.error('Erro ao criar post'); return }
          setPosts(prev => [res.post as Post, ...prev])
          toast.success('Post criado!')
        }
        setIsFormOpen(false)
      } catch (e: any) {
        toast.error(e.message || 'Erro inesperado')
      }
    })
  }

  const handleDelete = (id: string) => setDeleteId(id)

  const confirmDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      await deleteBlogPost(deleteId)
      setPosts(prev => prev.filter(p => p.id !== deleteId))
      setDeleteId(null)
      toast.success('Post excluído.')
    })
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mt-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Buscar post..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-10"
          />
        </div>
        <Button
          onClick={openCreate}
          className="bg-accent hover:bg-white text-black font-black uppercase tracking-widest px-6 h-10 rounded-xl"
        >
          <Plus size={16} className="mr-2" /> Novo Post
        </Button>
      </div>

      {/* Posts List */}
      <div className="mt-8 space-y-3">
        {filteredPosts.length === 0 && (
          <div className="py-16 text-center text-white/30 text-sm font-medium border-2 border-dashed border-white/10 rounded-2xl">
            Nenhum post encontrado.
          </div>
        )}
        {filteredPosts.map(post => (
          <div key={post.id} className="flex items-center gap-4 p-5 rounded-2xl bg-[#111] border border-white/5 hover:border-accent/20 transition-all">
            <FileText size={20} className="text-accent/60 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-black text-white truncate">{post.title}</p>
              <p className="text-xs text-white/30 font-mono mt-0.5">/{post.slug}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {post.publishedAt && (
                <span className="text-[10px] text-white/30 flex items-center gap-1 font-medium">
                  <Calendar size={10} />
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
              <Badge className={cn(
                'text-[9px] font-black uppercase tracking-widest rounded-lg px-2',
                post.status === 'published'
                  ? 'bg-accent/20 text-accent border-accent/20'
                  : 'bg-white/5 text-white/30 border-white/10'
              )}>
                {post.status === 'published' ? 'Publicado' : 'Rascunho'}
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" asChild className="text-white/40 hover:text-white hover:bg-white/5 rounded-lg h-8 w-8 p-0">
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye size={14} />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(post)} className="text-white/40 hover:text-accent hover:bg-accent/5 rounded-lg h-8 w-8 p-0">
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-white/40 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg h-8 w-8 p-0">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-[2rem] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {editingPost ? 'Editar Post' : 'Novo Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Título</label>
              <Input
                placeholder="Título do artigo"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Slug (URL)</label>
              <Input
                placeholder="meu-artigo-incrivel"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="bg-white/5 border-white/10 rounded-xl h-12 font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Resumo (Excerpt)</label>
              <Input
                placeholder="Breve descrição do artigo..."
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                className="bg-white/5 border-white/10 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Autor</label>
              <Input
                value={form.authorName}
                onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                className="bg-white/5 border-white/10 rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Conteúdo (HTML)</label>
              <textarea
                placeholder="<p>Conteúdo do artigo em HTML...</p>"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={12}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent/20 resize-y font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</label>
              <div className="flex gap-3">
                {(['draft', 'published'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border transition-all',
                      form.status === s
                        ? 'bg-accent/20 text-accent border-accent/30'
                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                    )}
                  >
                    {s === 'draft' ? 'Rascunho' : 'Publicado'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="border-white/10 text-white rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-accent hover:bg-white text-black font-bold rounded-xl"
            >
              {isPending ? 'Salvando...' : editingPost ? 'Salvar Alterações' : 'Criar Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-zinc-900 border-white/10 text-white rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Excluir Post?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Esta ação não pode ser desfeita. O post será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white bg-transparent rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
