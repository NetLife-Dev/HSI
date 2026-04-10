'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteProperty } from '@/actions/properties'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function DeletePropertyButton({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const [open, setOpen] = useState(false)
  const [hasBookings, setHasBookings] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleInitialDelete = () => {
    startTransition(async () => {
      const res = await deleteProperty(propertyId, false)
      if (res.hasBookings) {
        setHasBookings(true)
      } else if (res.success) {
        toast.success('Imóvel excluído.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Erro ao excluir imóvel.')
        setOpen(false)
      }
    })
  }

  const handleCascadeDelete = () => {
    startTransition(async () => {
      const res = await deleteProperty(propertyId, true)
      if (res.success) {
        toast.success('Imóvel e estadias canceladas foram excluídos.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Erro ao excluir imóvel.')
        setOpen(false)
      }
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setHasBookings(false); setOpen(true) }}
        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
      >
        <Trash2 size={14} />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-zinc-900 border-white/10 text-white rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">
              {hasBookings ? 'Imóvel com Estadias Ativas' : `Excluir "${propertyName}"?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 leading-relaxed">
              {hasBookings
                ? 'Este imóvel possui estadias ou reservas vinculadas. O que deseja fazer?'
                : 'Esta ação não pode ser desfeita. O imóvel será removido permanentemente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="border-white/10 text-white bg-transparent rounded-xl">
              Não excluir
            </AlertDialogCancel>
            {hasBookings ? (
              <Button
                onClick={handleCascadeDelete}
                disabled={isPending}
                className="bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold"
              >
                {isPending ? 'Excluindo...' : 'Cancelar estadias e excluir imóvel'}
              </Button>
            ) : (
              <Button
                onClick={handleInitialDelete}
                disabled={isPending}
                className="bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold"
              >
                {isPending ? 'Excluindo...' : 'Excluir imóvel'}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
