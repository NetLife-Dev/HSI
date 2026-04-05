import { CalendarDays, DollarSign, Home, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from '@/components/admin/KpiCard'

export default function DashboardPage() {
  // Phase 1: All KPI values are loading state (skeleton)
  // Real data queries come in Phase 3 (bookings) and Phase 4 (financial)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Visão geral da operação
        </p>
      </div>

      {/* KPI Cards — DASH-01 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Reservas Ativas"
          icon={CalendarDays}
          loading
        />
        <KpiCard
          label="Faturamento do Mês"
          icon={DollarSign}
          loading
        />
        <KpiCard
          label="Taxa de Ocupação"
          icon={Home}
          loading
        />
        <KpiCard
          label="Próximos Check-ins"
          icon={TrendingUp}
          loading
        />
      </div>

      {/* Charts row — DASH-02 + DASH-03 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[var(--color-text-primary)]">
              Receita Mensal
            </CardTitle>
            <p className="text-xs text-[var(--color-text-secondary)]">Últimos 12 meses</p>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg" />
            <p className="text-xs text-center text-[var(--color-text-tertiary)] mt-3">
              Dados disponíveis após as primeiras reservas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[var(--color-text-primary)]">
              Taxa de Ocupação
            </CardTitle>
            <p className="text-xs text-[var(--color-text-secondary)]">Por imóvel</p>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg" />
            <p className="text-xs text-center text-[var(--color-text-tertiary)] mt-3">
              Dados disponíveis após as primeiras reservas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings + Alerts row — DASH-04 + DASH-05 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[var(--color-text-primary)]">
              Próximas Reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
            <p className="text-xs text-center text-[var(--color-text-tertiary)] pt-2">
              Nenhuma reserva ainda
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-surface-elevated)] border-[var(--color-border)]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[var(--color-text-primary)]">
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Reservas aguardando pagamento
              </p>
              <Skeleton className="h-5 w-8 mt-1" />
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Check-outs hoje
              </p>
              <Skeleton className="h-5 w-8 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
