import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value?: string | number
  icon: LucideIcon
  description?: string
  loading?: boolean
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  className?: string
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  description,
  loading = false,
  trend,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('bg-[var(--color-surface-elevated)] border-[var(--color-border)]', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-semibold text-[var(--color-text-primary)]">
                {value ?? '—'}
              </p>
            )}
            {description && !loading && (
              <p className="text-xs text-[var(--color-text-tertiary)]">{description}</p>
            )}
            {trend && !loading && (
              <p className={cn(
                'text-xs font-medium',
                trend.positive ? 'text-green-500' : 'text-red-500'
              )}>
                {trend.positive ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 ml-4">
            <Icon size={18} className="text-[var(--color-accent)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
