'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Calendar, DollarSign, ArrowRight, FileDown, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ProposalPDF } from '@/components/admin/hospedes/ProposalPDF'
import { convertLeadToReservation } from '@/actions/crm'
import { toast } from 'sonner'

type Status = 'lead' | 'negociacao' | 'proposta' | 'reserva'

interface GuestCard {
  id: string
  name: string
  property: string
  dates: string
  value: number
  status: Status
}

const MOCK_GUESTS: GuestCard[] = [
  { id: '1', name: 'Carlos Ferreira', property: 'Villa Ocean View', dates: '10 - 15 Abr', value: 15500, status: 'lead' },
  { id: '2', name: 'Marina Silva', property: 'Refúgio da Mata', dates: '20 - 25 Mai', value: 12000, status: 'lead' },
  { id: '3', name: 'Roberto Almeida', property: 'Cobertura Skyline', dates: '05 - 10 Jun', value: 18000, status: 'negociacao' },
  { id: '4', name: 'Juliana Costa', property: 'Villa Ocean View', dates: '12 - 18 Jul', value: 18600, status: 'proposta' },
  { id: '5', name: 'Fernando Souza', property: 'Refúgio da Mata', dates: '01 - 04 Ago', value: 6600, status: 'reserva' },
]

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'lead', title: 'Leads (Novos)' },
  { id: 'negociacao', title: 'Em Negociação' },
  { id: 'proposta', title: 'Proposta Enviada' },
  { id: 'reserva', title: 'Reserva Confirmada' },
]

export default function CRMPage() {
  const [cards, setCards] = useState<GuestCard[]>(MOCK_GUESTS)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Avoid Hydration issues with PDF renderer
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault()
    if (!draggedCardId) return
    setCards(prev => prev.map(card =>
      card.id === draggedCardId ? { ...card, status: targetStatus } : card
    ))
    setDraggedCardId(null)
  }

  const handleConvertToReservation = async (card: GuestCard) => {
    const res = await convertLeadToReservation(card.id, {
      guestName: card.name,
      property: card.property,
      value: card.value,
      checkIn: '2026-04-12',
      checkOut: '2026-04-15'
    })

    if (res.success) {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'reserva' } : c))
      toast.success(`${card.name} convertido em reserva e adicionado ao financeiro!`, {
        icon: <CheckCircle2 className="text-emerald-400" />
      })
    } else {
      toast.error('Erro ao converter reserva: ' + res.error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            CRM de Hóspedes
          </h1>
          <p className="text-white/50 font-medium">Gerencie seu funil de conversão e negociações em andamento.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Buscar hóspede..."
              className="pl-9 h-10 w-full md:w-64 rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent/30"
            />
          </div>
          <Button className="rounded-full shadow-lg gap-2 h-10 bg-accent hover:bg-white text-black font-bold">
            <Plus size={16} />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] snap-x pt-4 custom-scrollbar">
        {COLUMNS.map(column => (
          <div
            key={column.id}
            className="flex-none w-80 rounded-3xl p-4 bg-[#111] border border-accent/20 shadow-lg snap-center"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-black text-white text-xs uppercase tracking-widest">{column.title}</h3>
              <span className="bg-accent/10 text-accent text-xs font-black px-2 py-1 rounded-full border border-accent/20">
                {cards.filter(c => c.status === column.id).length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {cards.filter(c => c.status === column.id).map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  className={`bg-black rounded-2xl p-5 border border-accent/20 cursor-grab active:cursor-grabbing hover:border-accent/50 hover:shadow-accent/10 hover:shadow-lg transition-all ${draggedCardId === card.id ? 'opacity-50 scale-95' : 'opacity-100'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-white leading-tight">{card.name}</h4>
                    <button className="text-white/30 hover:text-accent transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 inline-flex px-2 py-1 rounded-lg">
                      {card.property}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Calendar size={12} className="text-accent/60" />
                      {card.dates}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60 font-medium pt-1">
                      <DollarSign size={12} className="text-emerald-400" />
                      {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {column.id === 'proposta' && (
                      <Button 
                        onClick={() => handleConvertToReservation(card)}
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl text-xs font-bold gap-2 text-emerald-400 border-emerald-400/20 bg-emerald-400/5 hover:bg-emerald-400/10 hover:text-emerald-300 transition-all active:scale-95"
                      >
                        Converter em Reserva <ArrowRight size={14} />
                      </Button>
                    )}
                    
                    {column.id === 'lead' && isMounted && (
                      <PDFDownloadLink
                        document={<ProposalPDF guestName={card.name} propertyName={card.property} dates={card.dates} totalValue={card.value} />}
                        fileName={`Proposta_${card.name.replace(' ', '_')}.pdf`}
                      >
                        {({ loading }) => (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full rounded-xl text-xs font-bold text-white/50 hover:text-accent hover:bg-accent/5 gap-2"
                          >
                            <FileDown size={14} />
                            {loading ? 'Preparando...' : 'Gerar Proposta PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}

                    {column.id === 'reserva' && (
                       <div className="flex items-center justify-center gap-2 py-2 text-emerald-400/60 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={12} />
                          Finalizado
                       </div>
                    )}
                  </div>
                </div>
              ))}

              {cards.filter(c => c.status === column.id).length === 0 && (
                <div className="border-2 border-dashed border-accent/10 rounded-2xl h-32 flex items-center justify-center text-white/20 text-sm font-medium">
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
