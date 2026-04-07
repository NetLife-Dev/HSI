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
  images: { id: string; url: string; isCover: boolean }[]
  seasonalPricing?: { name: string; startDate: string; endDate: string; pricePerNight: number }[]
  services?: { id: string; name: string; description: string; price: number; unit: string }[]
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
      { id: 'img-1-1', url: '/images/mock/exterior.png', isCover: true },
      { id: 'img-1-2', url: '/images/mock/living.png', isCover: false },
      { id: 'img-1-3', url: '/images/mock/bedroom.png', isCover: false },
      { id: 'img-1-4', url: '/images/mock/outdoor.png', isCover: false }
    ],
    seasonalPricing: [
      { name: 'Réveillon', startDate: '2024-12-28', endDate: '2025-01-05', pricePerNight: 850000 },
      { name: 'Carnaval', startDate: '2025-02-28', endDate: '2025-03-05', pricePerNight: 650000 }
    ],
    services: [
      { id: 's1', name: 'Aluguel de Jet Ski', description: 'Sea-Doo Spark por dia', price: 85000, unit: 'per_day' },
      { id: 's2', name: 'Faxina Extra', description: 'Limpeza completa durante a estadia', price: 15000, unit: 'total' }
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
      { id: 'img-2-1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isCover: true },
      { id: 'img-2-2', url: 'https://images.unsplash.com/photo-1600566753190-17f0bbc2a6c3?auto=format&fit=crop&w=1200&q=80', isCover: false }
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
      { id: 'img-3-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isCover: true },
      { id: 'img-3-2', url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80', isCover: false }
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
      { id: 'img-4-1', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', isCover: true }
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
      { id: 'img-5-1', url: 'https://images.unsplash.com/photo-1449156001433-4d7698a6ec2c?auto=format&fit=crop&w=1200&q=80', isCover: true }
    ],
    createdAt: new Date()
  }
]
