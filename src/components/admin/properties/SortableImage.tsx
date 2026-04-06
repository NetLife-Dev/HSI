'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Star,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SortableImageProps {
  image: {
    id: string
    url: string
    isCover: boolean
  }
  onDelete: (id: string) => void
  onSetCover: (id: string) => void
}

export function SortableImage({ image, onDelete, onSetCover }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-square rounded-lg border border-border bg-muted overflow-hidden group/card',
        isDragging && 'z-50 opacity-50 border-primary'
      )}
    >
      <Image
        src={image.url}
        alt="Foto do imóvel"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      />

      {/* Toolbar - Header */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 rounded-full bg-white/80 hover:bg-white text-destructive shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(image.id)
          }}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Toolbar - Footer */}
      <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent">
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'h-7 px-2 text-[10px] uppercase font-bold tracking-wider',
            image.isCover ? 'text-amber-400' : 'text-white hover:text-amber-400'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onSetCover(image.id)
          }}
        >
          <Star size={10} className={cn('mr-1', image.isCover && 'fill-amber-400')} />
          {image.isCover ? 'Capa' : 'Definir Capa'}
        </Button>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-white/20 text-white transition-colors"
        >
          <GripVertical size={14} />
        </div>
      </div>

      {/* Indicator - Cover (Permanent) */}
      {image.isCover && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-amber-400 text-amber-950 flex items-center gap-1 border border-amber-500/50">
          <Star size={8} className="fill-current" />
          Capa do Imóvel
        </div>
      )}
    </div>
  )
}
