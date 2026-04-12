import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env') })
import { getBlogPosts } from '../src/actions/blog'

async function debug() {
  console.log('--- Debugging Blog Action ---')
  try {
    const posts = await getBlogPosts('published')
    console.log('Published posts:', posts.length)
    console.table(posts.map(p => ({ id: p.id, title: p.title, status: p.status })))
  } catch (e: any) {
    console.error('Error in action:', e.message)
  }
}

debug()
