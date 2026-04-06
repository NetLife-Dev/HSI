'use client'

import { useState } from 'react'
import { Save, Palette, Building2, CreditCard, Shield, Users, Mail, UserPlus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'geral' | 'identidade' | 'pagamento' | 'equipe'>('geral')

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações Base</h1>
          <p className="text-slate-500 font-medium">Configure a identidade do seu portfólio e taxas vitais.</p>
        </div>
        <Button className="rounded-full shadow-lg gap-2 h-10 px-8">
          <Save size={16} />
          Salvar Alterações
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 space-y-2">
            <button 
                onClick={() => setActiveTab('geral')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === 'geral' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
                <Building2 size={18} /> Detalhes do Negócio
            </button>
            <button 
                onClick={() => setActiveTab('identidade')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === 'identidade' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
                <Palette size={18} /> Identidade Visual
            </button>
            <button 
                onClick={() => setActiveTab('pagamento')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === 'pagamento' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
                <CreditCard size={18} /> Pagamentos Stripe
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm min-h-[400px]">
            {activeTab === 'geral' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">Detalhes do Portfólio</h2>
                        <p className="text-sm text-slate-500">Estas informações ficarão visíveis para o público geral no rodapé do site.</p>
                    </div>
                    <Separator className="bg-slate-100" />
                    
                    <div className="space-y-4 max-w-xl">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nome Oficial</label>
                            <Input defaultValue="HostSemImposto Exclusive" className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">WhatsApp de Atendimento</label>
                            <Input defaultValue="+55 (11) 99999-9999" className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">E-mail Comercial</label>
                            <Input defaultValue="concierge@hostsemimposto.com" className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'identidade' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">Aparencia e Tema</h2>
                        <p className="text-sm text-slate-500">Mude a cor de destaque principal do site de reservas.</p>
                    </div>
                    <Separator className="bg-slate-100" />
                    
                    <div className="space-y-4 max-w-xl">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Cor Primária (Hexadecimal)</label>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full shadow-inner border border-slate-200 bg-[#E0B050]" />
                                <Input defaultValue="#E0B050" className="bg-slate-50 border-slate-200 h-12 rounded-xl font-mono" />
                            </div>
                            <p className="text-xs text-slate-400 pt-2">Esta cor modificará os botões e os acentos do layout público.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pagamento' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-start justify-between">
                       <div>
                           <h2 className="text-xl font-bold tracking-tight text-slate-800">Integração Financeira</h2>
                           <p className="text-sm text-slate-500">Chaves de API do seu processador de pagamento.</p>
                       </div>
                       <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-100">
                          <Shield size={12} /> Seguro
                       </div>
                    </div>
                    <Separator className="bg-slate-100" />
                    
                    <div className="space-y-4 max-w-xl">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Stripe Public Key</label>
                            <Input type="password" defaultValue="pk_live_xxxxxxxxx" className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Stripe Secret Key</label>
                            <Input type="password" defaultValue="sk_live_xxxxxxxxx" className="bg-slate-50 border-slate-200 h-12 rounded-xl" />
                        </div>
                        <div className="pt-4 border-t border-slate-50 mt-6">
                            <p className="text-sm font-medium text-slate-600">Ao preencher as chaves de API, as transações automáticas via cartão via Checkout serão habilitadas na face pública.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'equipe' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-start justify-between">
                       <div>
                           <h2 className="text-xl font-bold tracking-tight text-slate-800">Membros da Equipe</h2>
                           <p className="text-sm text-slate-500">Convide administradores, recepcionistas e faxineiras e restrija acessos.</p>
                       </div>
                       <Button className="rounded-full gap-2 h-10 px-6">
                          <UserPlus size={16} /> Convidar Membro
                       </Button>
                    </div>
                    <Separator className="bg-slate-100" />
                    
                    <div className="space-y-4 max-w-2xl">
                        <div className="border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">GF</div>
                               <div>
                                  <p className="font-bold text-slate-900">Gabriel</p>
                                  <p className="text-slate-500 text-xs">Proprietário (Admin Supremo)</p>
                               </div>
                            </div>
                            <span className="text-xs font-bold text-slate-300">Acesso Total</span>
                        </div>

                        <div className="border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">MA</div>
                               <div>
                                  <p className="font-bold text-slate-900">Maria (Concierge)</p>
                                  <p className="text-slate-500 text-xs">maria@hostsemimposto.com</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Editor (Reservas & CRM)</span>
                               <button className="text-slate-400 hover:text-slate-900"><MoreVertical size={16}/></button>
                            </div>
                        </div>

                        <div className="border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between text-sm opacity-60">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center"><Mail size={16}/></div>
                               <div>
                                  <p className="font-bold text-slate-900">roberto.limpeza@gmail.com</p>
                                  <p className="text-amber-500 text-xs font-medium">Convite Pendente</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Leitor (Apenas Kanban)</span>
                               <button className="text-slate-400 hover:text-slate-900"><MoreVertical size={16}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
