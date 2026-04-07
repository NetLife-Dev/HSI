'use client'

import React, { useState } from 'react'
import { Plus, X, Sparkles, Pencil, Trash2, Tag, Info, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PropertyService {
  id: string
  name: string
  description: string
  price: number
  unit: 'total' | 'per_day' | 'per_guest'
}

interface PropertyServiceManagerProps {
  propertyId: string
  initialServices?: PropertyService[]
}

export function PropertyServiceManager({ propertyId, initialServices = [] }: PropertyServiceManagerProps) {
  const [services, setServices] = useState<PropertyService[]>(initialServices)
  const [isAdding, setIsAdding] = useState(false)
  const [newService, setNewService] = useState<Partial<PropertyService>>({
    name: '',
    description: '',
    price: 0,
    unit: 'total'
  })

  const handleAdd = () => {
    if (!newService.name || !newService.price) {
      toast.error('Preencha pelo menos o nome e o preço.')
      return
    }

    const service: PropertyService = {
      id: Math.random().toString(36).substr(2, 9),
      name: newService.name,
      description: newService.description || '',
      price: Number(newService.price),
      unit: newService.unit as any || 'total'
    }

    setServices([...services, service])
    setIsAdding(false)
    setNewService({ name: '', description: '', price: 0, unit: 'total' })
    toast.success('Serviço adicionado a este imóvel!')
  }

  const handleRemove = (id: string) => {
    setServices(services.filter(s => s.id !== id))
    toast.info('Serviço removido.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-accent rounded-full" />
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">Serviços On-Demand</h3>
        </div>
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            variant="ghost" 
            className="text-accent hover:bg-accent/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar Serviço
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 bg-accent/5 border border-accent/20 rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome do Serviço</label>
               <Input 
                 placeholder="Ex: Aluguel de Jet Ski" 
                 value={newService.name}
                 onChange={e => setNewService({ ...newService, name: e.target.value })}
                 className="bg-zinc-950 border-white/5 rounded-xl h-12 h-12" 
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Preço (R$)</label>
                  <Input 
                    type="number" 
                    placeholder="0,00" 
                    value={newService.price || ''}
                    onChange={e => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="bg-zinc-950 border-white/5 rounded-xl h-12 font-black text-accent" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Lógica</label>
                  <select 
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl h-12 px-3 text-xs text-white/80 outline-none"
                    value={newService.unit}
                    onChange={e => setNewService({ ...newService, unit: e.target.value as any })}
                  >
                    <option value="total">Único</option>
                    <option value="per_day">Por Dia</option>
                    <option value="per_guest">Por Hóspede</option>
                  </select>
                </div>
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Descrição curta</label>
             <Input 
               placeholder="Breve explicação do serviço..." 
               value={newService.description}
               onChange={e => setNewService({ ...newService, description: e.target.value })}
               className="bg-zinc-950 border-white/5 rounded-xl h-12" 
             />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
             <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl text-white/40">Cancelar</Button>
             <Button onClick={handleAdd} className="bg-accent hover:bg-white text-black font-black rounded-xl px-6">Salvar Serviço</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 && !isAdding && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem] text-white/20 space-y-2">
            <ShoppingBag size={48} className="opacity-10" />
            <p className="text-sm font-medium uppercase tracking-widest text-center">Nenhum serviço extra cadastrado<br/><span className="text-[10px] opacity-50">Diferencie seu imóvel com concierge exclusivo</span></p>
          </div>
        )}
        {services.map((service) => (
          <div key={service.id} className="group relative p-8 bg-[#18181B] border border-white/5 rounded-[2.5rem] hover:border-accent/20 transition-all hover:bg-[#1A1A1E] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform">
              <Sparkles size={80} className="text-accent" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-accent rounded-full shrink-0" />
                 <h4 className="font-black uppercase tracking-tighter text-white group-hover:text-accent transition-colors truncate">{service.name}</h4>
              </div>
              <p className="text-xs text-white/40 font-medium leading-relaxed line-clamp-2">
                {service.description || 'Nenhuma descrição fornecida.'}
              </p>
            </div>
            
            <div className="flex flex-col gap-1 mt-6 pt-6 border-t border-white/5">
               <span className="text-xl font-black text-white">
                  {(service.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
               </span>
               <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-widest border-accent/20 text-accent/60 px-2 rounded-lg">
                  {service.unit === 'per_day' ? 'Por Dia' : service.unit === 'per_guest' ? 'Por Hóspede' : 'Preço Único'}
               </Badge>
            </div>
            
            <button 
              onClick={() => handleRemove(service.id)}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/20 hover:text-red-500 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
