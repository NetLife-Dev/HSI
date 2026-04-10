import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  ...(process.env.CLOUDINARY_CLOUD_NAME && { cloud_name: process.env.CLOUDINARY_CLOUD_NAME }),
  ...(process.env.CLOUDINARY_API_KEY && { api_key: process.env.CLOUDINARY_API_KEY }),
  ...(process.env.CLOUDINARY_API_SECRET && { api_secret: process.env.CLOUDINARY_API_SECRET }),
  secure: true,
})

export { cloudinary }
