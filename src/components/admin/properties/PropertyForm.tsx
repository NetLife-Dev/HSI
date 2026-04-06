'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, type PropertySchema } from '@/lib/validations/property'
import { createProperty, updateProperty } from '@/actions/properties'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { slugify } from '@/lib/utils/slug'
import { RichTextEditor } from '../RichTextEditor'
import { ImageManager } from './ImageManager'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface PropertyFormProps {
  initialData?: any // to be typed properly later
}

export function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<PropertySchema>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      description: '',
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      cleaningFee: 0,
      minNights: 1,
      status: 'active',
      featured: false,
      videoUrl: '',
    },
  })

  async function onSubmit(data: PropertySchema) {
    setLoading(true)
    try {
      const result = initialData 
        ? await updateProperty(initialData.id, data) 
        : await createProperty(data)

      console.log('[PropertyForm] Action result:', result)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(initialData ? 'Imóvel atualizado!' : 'Imóvel criado!')
        router.push('/admin/imoveis')
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs defaultValue="geral" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50">
        <TabsTrigger value="geral" className="text-lg font-medium">Informações Gerais</TabsTrigger>
        <TabsTrigger 
          value="fotos" 
          disabled={!initialData?.id}
          className="text-lg font-medium"
          title={!initialData?.id ? 'Crie o imóvel primeiro para adicionar fotos' : ''}
        >
          Fotos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="geral">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Info Básica */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Imóvel</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Villa Serena — Beira-Mar" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e)
                              if (!initialData) {
                                form.setValue('slug', slugify(e.target.value))
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="px-3 h-9 bg-muted border border-r-0 rounded-l-md text-sm flex items-center text-muted-foreground">
                              /imovel/
                            </span>
                            <Input className="rounded-l-none" placeholder="villa-serena" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Identificador único na URL da página pública.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Capacidade e Valores */}
              <Card>
                <CardContent className="pt-6 grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máx. Hóspedes</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartos</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cleaningFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa de Limpeza (Cents)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>Em centavos (R$ 150,00 = 15000)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minNights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mín. Noites</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Descrição */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Descreva o imóvel cinematograficamente..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Criar Imóvel'}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="fotos">
        {initialData?.id && (
          <ImageManager 
            propertyId={initialData.id} 
            images={initialData.images || []} 
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
