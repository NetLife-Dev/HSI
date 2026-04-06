import { Metadata } from 'next'
import { db } from '@/db/index'
import { bookings, properties } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
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
  title: 'Reservas — Admin',
}

export default async function BookingsPage() {
  let bookingList: any[] = []

  try {
    bookingList = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
      with: {
        property: true,
      }
    })
  } catch (error) {
    console.warn('⚠️ [Admin/Reservas] Banco offline. Usando mocks.')
    bookingList = [
      { id: 'b1', guestName: 'Marcos Oliveira', checkIn: '2025-06-05', checkOut: '2025-06-12', status: 'confirmed', totalPrice: 850000, property: { name: 'Villa Ocean View' }, createdAt: new Date() },
      { id: 'b2', guestName: 'Ana Beatriz', checkIn: '2025-07-02', checkOut: '2025-07-05', status: 'pending', totalPrice: 220000, property: { name: 'Refúgio da Mata' }, createdAt: new Date() },
      { id: 'b3', guestName: 'Carlos Eduardo', checkIn: '2025-08-10', checkOut: '2025-08-20', status: 'confirmed', totalPrice: 450000, property: { name: 'Cobertura Skyline' }, createdAt: new Date() },
    ]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Gestão de Reservas
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Acompanhe os check-ins, check-outs e pagamentos.
        </p>
      </div>

      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hóspede</TableHead>
              <TableHead>Imóvel</TableHead>
              <TableHead>Check-in / Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[var(--color-text-secondary)] text-sm italic">
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            ) : (
              bookingList.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-[var(--color-text-primary)]">
                    {booking.guestName}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--color-text-secondary)]">
                    {booking.property?.name || '---'}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--color-text-secondary)]">
                    {format(new Date(booking.checkIn), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(booking.checkOut), 'dd/MM/yy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {booking.status === 'confirmed' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        Confirmada
                      </Badge>
                    ) : booking.status === 'pending' || booking.status === 'awaiting_payment' ? (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                        Pendente
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Cancelada</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-[var(--color-text-primary)]">
                    {(booking.totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs text-primary font-bold hover:underline">Ver Detalhes</button>
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
