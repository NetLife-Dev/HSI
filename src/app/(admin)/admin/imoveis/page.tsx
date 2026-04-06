import { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/db/index'
import { properties } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Imóveis — Admin',
}

export default async function PropertiesPage() {
  let propertyList: any[] = []
  
  try {
    propertyList = await db.query.properties.findMany({
      orderBy: [desc(properties.createdAt)],
    })
  } catch (error) {
    console.warn('⚠️ [Admin/Properties] Banco offline. Usando mocks para visualização.')
    propertyList = [
      { id: 'mock1', name: 'Villa Ocean View', slug: 'villa-ocean-view', status: 'active', maxGuests: 8, bedrooms: 4, createdAt: new Date() },
      { id: 'mock2', name: 'Refúgio da Mata', slug: 'refugio-da-mata', status: 'active', maxGuests: 6, bedrooms: 3, createdAt: new Date() },
      { id: 'mock3', name: 'Cobertura Skyline', slug: 'cobertura-skyline', status: 'maintenance', maxGuests: 4, bedrooms: 2, createdAt: new Date() },
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Gestão de Imóveis
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Cadastre e gerencie as propriedades da sua plataforma.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/imoveis/novo">
            <Plus className="mr-2" size={16} />
            Novo Imóvel
          </Link>
        </Button>
      </div>

      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imóvel</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertyList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[var(--color-text-secondary)] text-sm italic">
                  Nenhum imóvel cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              propertyList.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium text-[var(--color-text-primary)]">
                    {property.name}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-[var(--color-text-secondary)]">
                    /{property.slug}
                  </TableCell>
                  <TableCell>
                    {property.status === 'active' ? (
                      <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        Ativo
                      </Badge>
                    ) : property.status === 'maintenance' ? (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                        Manutenção
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--color-text-secondary)]">
                    {property.maxGuests} hóspedes / {property.bedrooms} quartos
                  </TableCell>
                  <TableCell className="text-sm text-[var(--color-text-secondary)]">
                    {format(property.createdAt!, 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/imoveis/${property.id}/editar`}>
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
