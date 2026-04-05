import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  DollarSign,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Imóveis', href: '/admin/imoveis', icon: Home },
  { label: 'Reservas', href: '/admin/reservas', icon: Calendar },
  { label: 'Hóspedes', href: '/admin/hospedes', icon: Users },
  { label: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]
