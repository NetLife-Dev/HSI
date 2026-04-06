import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PropertyForm } from '@/components/admin/properties/PropertyForm'

export const metadata: Metadata = {
  title: 'Editar Imóvel — Admin',
}

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.order)],
      },
    },
  })

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
