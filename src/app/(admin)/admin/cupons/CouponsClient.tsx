'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Search, Trash2, Pencil, Calendar, Settings, Info, Ticket, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createCoupon } from '@/actions/coupons'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CouponsClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    discountAmount: '',
    maxUses: '',
    validUntil: '',
  })

  const handleCreate = () => {
    if (!formData.code) return toast.error('Código é obrigatório')
    
    startTransition(async () => {
      const result = await createCoupon({
        code: formData.code,
        discountPercent: formData.discountPercent ? Number(formData.discountPercent) : undefined,
        discountAmount: formData.discountAmount ? Number(formData.discountAmount) * 100 : undefined,
        maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
        validUntil: formData.validUntil || undefined,
      })
      
      if (result.success) {
        toast.success('Cupom criado e sincronizado com Stripe!')
        setIsAddDialogOpen(false)
        setFormData({ code: '', discountPercent: '', discountAmount: '', maxUses: '', validUntil: '' })
      } else {
        toast.error('Erro: ' + result.error)
      }
    })
  }

  const filteredCoupons = initialCoupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-accent hover:bg-white text-black font-black uppercase tracking-widest px-8 h-12 rounded-2xl transition-all shadow-xl shadow-accent/20">
            <Plus className="mr-2 h-5 w-5" /> Novo Cupom
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Criar Novo Cupom</DialogTitle>
            <DialogDescription className="text-white/50">Configure o código e o valor do desconto.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">Código do Cupom</label>
              <Input 
                placeholder="Ex: LUXURY10" 
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="bg-white/5 border-white/10 rounded-xl h-12 font-black uppercase" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Desconto (% Off)</label>
                <Input 
                  type="number"
                  placeholder="10" 
                  value={formData.discountPercent}
                  onChange={e => setFormData({ ...formData, discountPercent: e.target.value, discountAmount: '' })}
                  className="bg-white/5 border-white/10 rounded-xl h-12" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Valor (R$ Off)</label>
                <Input 
                  type="number" 
                  placeholder="50,00" 
                  value={formData.discountAmount}
                  onChange={e => setFormData({ ...formData, discountAmount: e.target.value, discountPercent: '' })}
                  className="bg-white/5 border-white/10 rounded-xl h-12 font-bold" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">Data de Expiração</label>
              <Input 
                type="date" 
                value={formData.validUntil}
                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                className="bg-white/5 border-white/10 rounded-xl h-12" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">Limite de Usos</label>
              <Input 
                type="number" 
                placeholder="Ilimitado se vazio" 
                value={formData.maxUses}
                onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                className="bg-white/5 border-white/10 rounded-xl h-12" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl border-white/10 text-white">Cancelar</Button>
            <Button 
              disabled={isPending}
              className="bg-accent hover:bg-white text-black font-bold rounded-xl"
              onClick={handleCreate}
            >
              {isPending ? 'Sincronizando...' : 'Gerar Cupom'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabela de Cupons */}
      <div className="w-full mt-12">
        <Card className="bg-[#151515] border-white/10 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Ativos e Expirados</CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  placeholder="Pesquisar código..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 rounded-xl" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Código</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Desconto</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Uso</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Expiração</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-6 rounded-full", coupon.isActive ? 'bg-accent' : 'bg-white/10')} />
                        <span className="font-black text-lg tracking-tight uppercase group-hover:text-accent transition-colors">{coupon.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-white">
                        {coupon.discountPercent ? `${coupon.discountPercent}% OFF` : `R$ ${((coupon.discountAmount || 0) / 100).toFixed(2)} OFF`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-white/60">{coupon.usedCount} / {coupon.maxUses || '∞'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-widest">
                        <Calendar size={12} />
                        {coupon.validUntil || 'Vitalício'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={cn("rounded-lg text-[9px] font-black uppercase tracking-widest", coupon.isActive ? 'bg-accent/20 text-accent border-accent/20' : 'bg-white/5 text-white/20 border-white/10')}>
                         {coupon.isActive ? 'Ativo' : 'Inativo'}
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
