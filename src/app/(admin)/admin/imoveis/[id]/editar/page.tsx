import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PropertyForm } from '@/components/admin/properties/PropertyForm'
import { MOCK_PROPERTIES } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Editar Imóvel — Admin',
}

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params

  let property: any = null

  // UAT Fallback: Se for um ID de mock, pegamos dos mocks
  if (id.startsWith('mock')) {
    property = MOCK_PROPERTIES.find(p => p.id === id)
  } else {
    try {
      property = await db.query.properties.findFirst({
        where: eq(properties.id, id),
        with: {
          images: {
            orderBy: (images, { asc }) => [asc(images.order)],
          },
        },
      })
    } catch (e) {
      console.warn('⚠️ [Admin/Edit] Erro ao buscar imóvel. Possível UUID inválido em modo UAT.')
    }
  }

  if (!property) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Editar Imóvel
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Atualize os dados e configurações do imóvel <strong>{property.name}</strong>.
        </p>
      </div>

      <PropertyForm initialData={property} />
    </div>
  )
}
