import { z } from 'zod'

export const propertySchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'O slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug inválido (use apenas letras minúsculas, números e hífens)'),
  description: z.string().optional(),
  locationAddress: z.string().optional(),
  locationLat: z.string().optional(),
  locationLng: z.string().optional(),
  maxGuests: z.coerce.number().int().min(1, 'Mínimo de 1 hóspede'),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(0),
  cleaningFee: z.coerce.number().int().min(0, 'Taxa de limpeza não pode ser negativa'),
  minNights: z.coerce.number().int().min(1, 'Mínimo de 1 noite'),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  featured: z.boolean().default(false),
  rules: z.string().optional(),
  videoUrl: z.string().url('URL de vídeo inválida').optional().or(z.literal('')),
})

export type PropertySchema = z.infer<typeof propertySchema>
