'use client'

import { useState } from 'react'
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Filter, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MOCK_TRANSACTIONS = [
  { id: '1', date: '2026-04-12', description: 'Reserva - Villa Ocean View (#NL-X84K9P)', category: 'Entrada', amount: 15500, type: 'credit' },
  { id: '2', date: '2026-04-10', description: 'Taxa de Limpeza - Refúgio da Mata', category: 'Serviço', amount: 250, type: 'credit' },
  { id: '3', date: '2026-04-08', description: 'Manutenção Piscina (Mensal)', category: 'Manutenção', amount: 450, type: 'debit' },
  { id: '4', date: '2026-04-05', description: 'Reserva - Cobertura Skyline (#NL-M99T2)', category: 'Entrada', amount: 8900, type: 'credit' },
  { id: '5', date: '2026-04-02', description: 'Comissão Plataforma (Stripe)', category: 'Taxa', amount: 350, type: 'debit' },
]

export default function FinanceiroPage() {
  const [filter, setFilter] = useState('all')

  const totalReceitas = MOCK_TRANSACTIONS.filter(t => t.type === 'credit').reduce((acc, curr) => acc + curr.amount, 0)
  const totalDespesas = MOCK_TRANSACTIONS.filter(t => t.type === 'debit').reduce((acc, curr) => acc + curr.amount, 0)
  const saldoLiquido = totalReceitas - totalDespesas

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-slate-500 font-medium">Acompanhe de perto a saúde financeira do seu portfólio.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full shadow-sm gap-2 text-slate-600">
            <Download size={16} /> Exportar Extrato
          </Button>
          <Button className="rounded-full shadow-lg gap-2">
            <Plus size={16} /> Nova Transação
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
                 <DollarSign size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Líquido Mensal</span>
           </div>
           <div className="space-y-1">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                {saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
              </h2>
              <p className="flex items-center text-emerald-500 text-sm font-bold gap-1 mt-2">
                 <TrendingUp size={16} /> +12% do mês anterior
              </p>
           </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full blur-3xl" />
           <div className="relative">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <ArrowUpRight size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total de Receitas</span>
             </div>
             <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                </h2>
             </div>
           </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-32 h-32 bg-rose-50 rounded-full blur-3xl" />
           <div className="relative">
             <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                   <ArrowDownRight size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Despesas Variáveis</span>
             </div>
             <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                </h2>
             </div>
           </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mt-8">
         <div className="flex items-center justify-between p-6 md:px-8 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Histórico de Transações</h3>
            <Button variant="ghost" className="rounded-full gap-2 text-slate-500 font-bold">
               <Filter size={16} /> Filtros
            </Button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                     <th className="font-bold py-4 px-8">Data</th>
                     <th className="font-bold py-4 px-8">Descrição</th>
                     <th className="font-bold py-4 px-8">Categoria</th>
                     <th className="font-bold py-4 px-8 text-right">Valor</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {MOCK_TRANSACTIONS.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                       <td className="py-5 px-8 font-medium text-slate-400">
                         {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric'})}
                       </td>
                       <td className="py-5 px-8 font-bold text-slate-700">{tx.description}</td>
                       <td className="py-5 px-8">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                             tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {tx.category}
                          </span>
                       </td>
                       <td className={`py-5 px-8 text-right font-black ${
                          tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-900'
                       }`}>
                          {tx.type === 'credit' ? '+ ' : '- '}
                          {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}
