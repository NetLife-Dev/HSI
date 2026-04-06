import { CalendarDays, DollarSign, Home, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from '@/components/admin/KpiCard'

export default function DashboardPage() {
  // Realistic Mock Data for UI/UX testing in current restricted DB state
  const mockStats = {
    activeBookings: 12,
    monthlyRevenue: "R$ 48.500",
    occupancyRate: "72%",
    upcomingCheckins: 5
  }

  const mockBookings = [
    { id: 1, guest: "Marcos Oliveira", property: "Villa Ocean View", status: "Confirmado", value: "R$ 15.000" },
    { id: 2, guest: "Ana Beatriz", property: "Refúgio da Mata", status: "Pendente", value: "R$ 8.400" },
    { id: 3, guest: "Carlos Eduardo", property: "Cobertura Skyline", status: "Confirmado", value: "R$ 22.000" }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-display font-medium text-[var(--color-text-primary)]">Overview Operacional</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Bem-vindo de volta, Gabriel. Aqui está o status dos seus imóveis hoje.
        </p>
      </div>

      {/* KPI Cards — DASH-01 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Reservas Ativas"
          icon={CalendarDays}
          value={mockStats.activeBookings}
          trend={{ value: 12, label: "vs mês ant.", positive: true }}
        />
        <KpiCard
          label="Faturamento Mes"
          icon={DollarSign}
          value={mockStats.monthlyRevenue}
          trend={{ value: 8, label: "em crescimento", positive: true }}
        />
        <KpiCard
          label="Taxa de Ocupação"
          icon={Home}
          value={mockStats.occupancyRate}
        />
        <KpiCard
          label="Próximos Check-ins"
          icon={TrendingUp}
          value={mockStats.upcomingCheckins}
        />
      </div>

      {/* Charts row — DASH-02 + DASH-03 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[var(--color-text-primary)]">
              Receita Mensal
            </CardTitle>
            <p className="text-xs text-[var(--color-text-secondary)]">Projeção Baseada em Reservas</p>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full bg-black/20 rounded-2xl flex items-end justify-between p-4 gap-2">
               {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                 <div key={i} className="flex-1 bg-accent/20 rounded-t-lg relative group transition-all hover:bg-accent/40" style={{ height: `${h}%` }}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[var(--color-text-primary)]">
              Performance por Imóvel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Villa Ocean View", val: 85 },
              { name: "Refúgio da Mata", val: 62 },
              { name: "Cobertura Skyline", val: 40 }
            ].map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-[var(--color-text-secondary)]">{p.name}</span>
                  <span className="text-accent">{p.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                   <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${p.val}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings + Alerts row — DASH-04 + DASH-05 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-[var(--color-surface-elevated)] border-[var(--color-border)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[var(--color-text-primary)]">
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/10 border border-white/5 hover:border-accent/20 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold uppercase">
                        {b.guest.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{b.guest}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">{b.property}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-mono font-bold text-accent">{b.value}</p>
                      <Badge variant="outline" className={cn(
                        "text-[9px] uppercase border-0 px-2", 
                        b.status === 'Confirmado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      )}>{b.status}</Badge>
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-accent/10 border-accent/20 rounded-3xl p-6">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-accent mb-2">Insight do Dia</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
              O imóvel <span className="text-accent underline font-bold">Refúgio da Mata</span> teve um aumento de 25% na procura após a atualização das fotos. Considere um ajuste dinâmico de preço para o próximo feriado.
            </p>
          </Card>
          
          <Card className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[var(--color-text-primary)]">
                Pendências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Limpezas Urgentes</p>
                <span className="text-xl font-mono font-bold text-red-500">02</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Check-outs Hoje</p>
                <span className="text-xl font-mono font-bold text-emerald-500">04</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
