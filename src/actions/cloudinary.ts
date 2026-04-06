'use server'

import { cloudinary } from '@/lib/cloudinary'
import { auth } from '@/lib/auth'

export async function getCloudinarySignature() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'owner' && session.user.role !== 'staff')) {
    throw new Error('Unauthorized')
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'hsi/properties',
    },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  }
}
