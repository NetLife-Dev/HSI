import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env') })
import { getBlogPosts } from '../src/actions/blog'

async function test() {
  try {
    const posts = await getBlogPosts('published')
    console.log('Posts found:', posts.length)
    console.log(posts.map(p => ({ title: p.title, status: p.status, publishedAt: p.publishedAt })))
  } catch (e) {
    console.error('Action failed:', e)
  }
}

test()
