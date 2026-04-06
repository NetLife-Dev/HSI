'use client'

import { useState, useTransition } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { propertyImages } from '@/db/schema'
import {
  Upload,
  X,
  Star,
  GripVertical,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  addPropertyImages,
  deletePropertyImage,
  reorderPropertyImages,
  setPropertyCover,
} from '@/actions/properties'
import { getCloudinarySignature } from '@/actions/cloudinary'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SortableImage } from './SortableImage'

interface ImageManagerProps {
  propertyId: string
  images: any[] // to be typed properly
}

export function ImageManager({ propertyId, images: initialImages }: ImageManagerProps) {
  const [images, setImages] = useState(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    const uploadedImages: { url: string; publicId: string }[] = []

    try {
      const signatureData = await getCloudinarySignature()

      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signatureData.apiKey!)
        formData.append('timestamp', signatureData.timestamp.toString())
        formData.append('signature', signatureData.signature)
        formData.append('folder', 'hsi/properties')

        const res = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (data.secure_url) {
          uploadedImages.push({
            url: data.secure_url,
            publicId: data.public_id,
          })
        }
      }

      if (uploadedImages.length > 0) {
        const result = await addPropertyImages(propertyId, uploadedImages)
        if (result.success) {
          toast.success(`${uploadedImages.length} foto(s) enviada(s)!`)
          // refresh is handled by revalidatePath in action
          // but we might want to optimistic update if needed
          window.location.reload() // simple way to sync for now
        } else {
          toast.error(result.error)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro ao fazer upload das fotos.')
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: isUploading,
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over?.id)

      const newOrdered = arrayMove(images, oldIndex, newIndex)
      setImages(newOrdered)

      startTransition(async () => {
        const result = await reorderPropertyImages(propertyId, newOrdered.map(img => img.id))
        if (!result.success) {
          toast.error('Erro ao salvar nova ordem.')
          setImages(images) // rollback
        }
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return

    const result = await deletePropertyImage(id)
    if (result.success) {
      toast.success('Foto removida.')
      window.location.reload()
    } else {
      toast.error(result.error)
    }
  }

  const handleSetCover = async (id: string) => {
    const result = await setPropertyCover(propertyId, id)
    if (result.success) {
      toast.success('Capa do imóvel atualizada.')
      window.location.reload()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-colors text-center cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="animate-spin text-primary" size={32} />
          ) : (
            <Upload className="text-muted-foreground" size={32} />
          )}
          <div className="space-y-1">
            <p className="font-medium">
              {isUploading ? 'Enviando fotos...' : 'Arraste e solte ou clique para enviar'}
            </p>
            <p className="text-sm text-muted-foreground">
              Fotos em alta resolução ajudam a vender mais. Máx 10MB cada.
            </p>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
                onDelete={handleDelete}
                onSetCover={handleSetCover}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
