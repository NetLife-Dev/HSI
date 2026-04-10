'use server'

import { db } from '@/db'
import { blogPosts } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

export async function getBlogPosts(statusFilter?: 'published' | 'draft' | 'all') {
  const query = db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt))
  if (statusFilter === 'published') {
    return db.select().from(blogPosts).where(eq(blogPosts.status, 'published')).orderBy(desc(blogPosts.publishedAt))
  }
  if (statusFilter === 'draft') {
    return db.select().from(blogPosts).where(eq(blogPosts.status, 'draft')).orderBy(desc(blogPosts.createdAt))
  }
  return query
}

export async function getBlogPostBySlug(slug: string) {
  return db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, slug) })
}

export async function createBlogPost(data: {
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  authorName?: string
  status?: 'draft' | 'published'
}) {
  await requireAdmin()
  const publishedAt = data.status === 'published' ? new Date() : null
  const [post] = await db.insert(blogPosts).values({
    ...data,
    authorName: data.authorName || 'HostSemImposto',
    status: data.status || 'draft',
    publishedAt,
  }).returning()
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true, post }
}

export async function updateBlogPost(id: string, data: {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  coverImageUrl?: string
  authorName?: string
  status?: 'draft' | 'published'
}) {
  await requireAdmin()
  const current = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) })
  if (!current) return { success: false, error: 'Post não encontrado' }

  const publishedAt = data.status === 'published' && current.status !== 'published'
    ? new Date()
    : current.publishedAt

  const [post] = await db.update(blogPosts)
    .set({ ...data, publishedAt, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning()

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/admin/blog')
  return { success: true, post }
}

export async function deleteBlogPost(id: string) {
  await requireAdmin()
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true }
}
