import { v2 as cloudinary } from 'cloudinary'

const configured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export function isCloudinaryConfigured() {
  return configured
}

export function uploadBuffer(buffer, options = {}) {
  if (!configured) throw new Error('Cloudinary storage is not configured')
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'fitmate/projects',
      resource_type: 'auto',
      ...options,
    }, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
    stream.end(buffer)
  })
}

export async function deleteAsset(publicId, resourceType = 'image') {
  if (!configured || !publicId) return
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: 'upload', invalidate: true })
}
