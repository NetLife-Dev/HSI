import 'dotenv/config'
import { db } from '../src/db'
import { blogPosts } from '../src/db/schema'

async function seed() {
  console.log('🌱 Seeding blog posts...')

  const posts = [
    {
      title: 'A Arte de Hospedar no Topo do Luxo',
      slug: 'arte-de-hospedar',
      excerpt: 'Descubra os segredos para transformar sua propriedade em um refúgio de classe mundial.',
      content: '<h2>O Início de Tudo</h2><p>Hospedagem de alto padrão não se trata apenas de metros quadrados, mas de cada detalhe que antecipa o desejo do hóspede...</p>',
      coverImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000',
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Destinos Inesquecíveis: O Litoral Norte',
      slug: 'litoral-norte-destinos',
      excerpt: 'As joias escondidas que atraem os viajantes mais exigentes do mundo.',
      content: '<h2>Exclusividade à beira-mar</h2><p>Onde o som das ondas encontra o silêncio da privacidade absoluta...</p>',
      coverImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Gastronomia na Estadia: Chefs em Casa',
      slug: 'gastronomia-estadia',
      excerpt: 'Leve a experiência de um restaurante Michelin para dentro da sua residência temporária.',
      content: '<h2>Sabor e Conforto</h2><p>Não há nada como um jantar preparado sob medida por um chef renomado enquanto você relaxa...</p>',
      coverImageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000',
      status: 'published',
      publishedAt: new Date(),
    }
  ]

  for (const post of posts) {
    try {
      await db.insert(blogPosts).values(post as any).onConflictDoNothing()
      console.log(`✅ Post seeded: ${post.title}`)
    } catch (e) {
      console.error(`❌ Error seeding post ${post.title}:`, e)
    }
  }

  console.log('✨ Blog seeding completed!')
}

seed().catch(console.error)
