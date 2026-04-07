'use client'

import React, { useState } from 'react'
import { Plus, Search, Sparkles, Pencil, Trash2, Tag, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'

// Temporary mock data — will be replaced with server actions
const MOCK_SERVICES = [
  { 
    id: '1', 
    name: 'Aluguel de Jet Ski', 
    description: 'Jet Ski Sea-Doo Spark triplex. Disponível por dia.', 
    price: 85000, 
    unit: 'per_day', 
    icon: 'Waves' 
  },
  { 
    id: '2', 
    name: 'Chef Privado', 
    description: 'Serviço de chef exclusivo para almoço e jantar.', 
    price: 45000, 
    unit: 'per_day', 
    icon: 'Utensils' 
  },
  { 
    id: '3', 
    name: 'Limpeza Extra', 
    description: 'Serviço de faxina completa durante a estadia.', 
    price: 15000, 
    unit: 'total', 
    icon: 'Sparkles' 
  },
]

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredServices = MOCK_SERVICES.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Sparkles className="text-accent" />
            Serviços <span className="text-white/40 font-medium">Concierge</span>
          </h1>
          <p className="text-white/50 font-medium">Gerencie experiências extras para seus hóspedes.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-white text-black font-black uppercase tracking-widest px-8 h-12 rounded-2xl transition-all shadow-xl shadow-accent/20">
              <Plus className="mr-2 h-5 w-5" /> Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-[2rem] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Adicionar Serviço</DialogTitle>
              <DialogDescription className="text-white/50">Crie um novo serviço opcional no checkout.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Nome do Serviço</label>
                <Input placeholder="Ex: Aluguel de Lancha" className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Preço (R$)</label>
                  <Input type="number" placeholder="0,00" className="bg-white/5 border-white/10 rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-white/40">Unidade</label>
                  <Select defaultValue="total">
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="total">Único</SelectItem>
                      <SelectItem value="per_day">Por Dia</SelectItem>
                      <SelectItem value="per_guest">Por Hóspede</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/40">Descrição</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-1 ring-accent min-h-24"
                  placeholder="Descreva o que está incluso..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-xl border-white/10 text-white"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-accent hover:bg-white text-black font-bold rounded-xl"
                onClick={() => {
                  toast.success('Serviço criado com sucesso!')
                  setIsAddDialogOpen(false)
                }}
              >
                Salvar Serviço
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-[#151515] border-white/10 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Listagem de Serviços</CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input 
                  placeholder="Pesquisar..." 
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
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Serviço</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Preço</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Unidade</TableHead>
                  <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                          <Tag size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-accent transition-colors">{service.name}</p>
                          <p className="text-xs text-white/40 line-clamp-1">{service.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-white">
                        {(service.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest">
                        {service.unit === 'per_day' ? 'Por Dia' : service.unit === 'per_guest' ? 'Por Hóspede' : 'Total'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-500">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="bg-accent/5 border-accent/20 rounded-[2rem] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black">
                <Info size={24} />
              </div>
              <h4 className="font-black uppercase tracking-tighter text-xl">Dica Pro</h4>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                Vincule serviços específicos a cada imóvel nas configurações de cada propriedade para aumentar seu ticket médio.
              </p>
           </Card>
        </div>
      </div>
    </div>
  )
}
