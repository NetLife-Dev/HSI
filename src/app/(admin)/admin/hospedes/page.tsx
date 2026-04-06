'use client'

import { useState } from 'react'
import { Plus, Search, MoreVertical, Calendar, DollarSign, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Status = 'lead' | 'negociacao' | 'proposta' | 'reserva' | 'finalizado'

interface GuestCard {
  id: string
  name: string
  property: string
  dates: string
  value: number
  status: Status
  avatar?: string
}

const MOCK_GUESTS: GuestCard[] = [
  { id: '1', name: 'Carlos Ferreira', property: 'Villa Ocean View', dates: '10 - 15 Abr', value: 15500, status: 'lead' },
  { id: '2', name: 'Marina Silva', property: 'Refúgio da Mata', dates: '20 - 25 Mai', value: 12000, status: 'lead' },
  { id: '3', name: 'Roberto Almeida', property: 'Cobertura Skyline', dates: '05 - 10 Jun', value: 18000, status: 'negociacao' },
  { id: '4', name: 'Juliana Costa', property: 'Villa Ocean View', dates: '12 - 18 Jul', value: 18600, status: 'proposta' },
  { id: '5', name: 'Fernando Souza', property: 'Refúgio da Mata', dates: '01 - 04 Ago', value: 6600, status: 'reserva' },
]

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: 'lead', title: 'Leads (Novos)', color: 'bg-slate-100/50' },
  { id: 'negociacao', title: 'Em Negociação', color: 'bg-blue-50/50' },
  { id: 'proposta', title: 'Proposta Enviada', color: 'bg-amber-50/50' },
  { id: 'reserva', title: 'Reserva Confirmada', color: 'bg-emerald-50/50' },
]

export default function CRMPage() {
  const [cards, setCards] = useState<GuestCard[]>(MOCK_GUESTS)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Hack to hide HTML5 ghost image partially or just let it be default
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault()
    if (!draggedCardId) return

    setCards(prev => prev.map(card => {
      if (card.id === draggedCardId) {
        return { ...card, status: targetStatus }
      }
      return card
    }))
    setDraggedCardId(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">CRM de Hóspedes</h1>
          <p className="text-slate-500 font-medium">Gerencie seu funil de conversão e negociações em andamento.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-grow md:flex-grow-0">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <Input placeholder="Buscar hóspede..." className="pl-9 h-10 w-full md:w-64 rounded-full border-slate-200" />
           </div>
           <Button className="rounded-full shadow-lg gap-2 h-10">
             <Plus size={16} />
             Novo Lead
           </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] snap-x pt-4">
        {COLUMNS.map(column => (
          <div 
            key={column.id} 
            className={`flex-none w-80 rounded-3xl p-4 border border-slate-200/60 shadow-sm snap-center ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">{column.title}</h3>
              <span className="bg-white text-slate-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {cards.filter(c => c.status === column.id).length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
              {cards.filter(c => c.status === column.id).map(card => (
                <div 
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/20 transition-all ${draggedCardId === card.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 leading-tight">{card.name}</h4>
                    <button className="text-slate-400 hover:text-slate-700">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-bold text-primary bg-primary/5 inline-flex px-2 py-1 rounded-lg">
                      {card.property}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      {card.dates}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                      <DollarSign size={12} className="text-emerald-500" />
                      {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>

                  {/* Actions depending on column */}
                  {column.id === 'proposta' && (
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold gap-2 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700">
                      Converter em Reserva <ArrowRight size={14} />
                    </Button>
                  )}
                  {column.id === 'lead' && (
                    <Button variant="ghost" size="sm" className="w-full rounded-xl text-xs font-bold text-slate-400 hover:text-primary hover:bg-primary/5">
                      Gerar Proposta PDF
                    </Button>
                  )}
                </div>
              ))}
              
              {/* Drop Zone visual affordance when empty */}
              {cards.filter(c => c.status === column.id).length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl h-32 flex items-center justify-center text-slate-400 text-sm font-medium">
                  Solte o card aqui
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
