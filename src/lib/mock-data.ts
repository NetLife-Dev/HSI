export interface MockProperty {
  id: string
  name: string
  description?: string
  slug: string
  locationAddress: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  beds: number
  amenities: string[]
  status: 'active' | 'inactive' | 'maintenance'
  featured: boolean
  basePrice: number // em centavos
  images: { url: string; isCover: boolean }[]
  createdAt: Date
}

export const MOCK_PROPERTIES: MockProperty[] = [
  {
    id: 'mock-1',
    name: 'Villa Ocean View',
    slug: 'villa-ocean-view',
    description: 'Uma obra-prima arquitetônica debruçada sobre o oceano, oferecendo vistas panorâmicas e privacidade absoluta.',
    locationAddress: 'Praia do Forte, Bahia',
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 5,
    beds: 6,
    amenities: ['Piscina Infinita', 'Sauna', 'Ducha Externa', 'Chef Privado', 'Wi-Fi 6G'],
    status: 'active',
    featured: true,
    basePrice: 450000,
    images: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', isCover: true },
      { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', isCover: false }
    ],
    createdAt: new Date()
  },
  {
    id: 'mock-2',
    name: 'Refúgio da Mata',
    slug: 'refugio-da-mata',
    description: 'Imersão total na natureza com todo o luxo de um resort cinco estrelas. O equilíbrio perfeito entre o rústico e o sofisticado.',
    locationAddress: 'Trancoso, Bahia',
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    beds: 4,
    amenities: ['Deck de Yoga', 'Jacuzzi', 'Fire Pit', 'Adega Climatizada'],
    status: 'active',
    featured: true,
    basePrice: 320000,
    images: [
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isCover: true },
      { url: 'https://images.unsplash.com/photo-1600566753190-17f0bbc2a6c3?auto=format&fit=crop&w=1200&q=80', isCover: false }
    ],
    createdAt: new Date()
  },
  {
    id: 'mock-3',
    name: 'Cobertura Skyline',
    slug: 'cobertura-skyline',
    description: 'No topo do mundo, onde o design moderno encontra a vista urbana mais cobiçada do litoral. O lifestyle supremo.',
    locationAddress: 'Jurerê Internacional, SC',
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    beds: 2,
    amenities: ['Automação Residencial', 'Heliponto', 'Piscina Suspensa', 'Cinema Particular'],
    status: 'active',
    featured: true,
    basePrice: 580000,
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isCover: true },
      { url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80', isCover: false }
    ],
    createdAt: new Date()
  },
  {
    id: 'mock-4',
    name: 'Casa do Lago',
    slug: 'casa-do-lago',
    description: 'Serenidade e sofisticação à beira d\'água. O refúgio ideal para quem busca paz sem abrir mão do conforto de alto padrão.',
    locationAddress: 'Angra dos Reis, RJ',
    maxGuests: 10,
    bedrooms: 5,
    bathrooms: 6,
    beds: 8,
    amenities: ['Píer Privativo', 'Lancha Inclusa', 'Área Gourmet', 'Quadra de Tênis'],
    status: 'active',
    featured: false,
    basePrice: 720000,
    images: [
      { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', isCover: true }
    ],
    createdAt: new Date()
  },
  {
    id: 'mock-5',
    name: 'Eco Lodge Altiplano',
    slug: 'eco-lodge-altiplano',
    description: 'Conecte-se com o céu e a montanha em um design eco-sustentável que redefine o luxo consciente.',
    locationAddress: 'São Bento do Sapucaí, SP',
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    beds: 3,
    amenities: ['Lareira Central', 'Observatório Astronômico', 'Horta Orgânica', 'Spa'],
    status: 'active',
    featured: false,
    basePrice: 280000,
    images: [
      { url: 'https://images.unsplash.com/photo-1449156001433-4d7698a6ec2c?auto=format&fit=crop&w=1200&q=80', isCover: true }
    ],
    createdAt: new Date()
  }
]
