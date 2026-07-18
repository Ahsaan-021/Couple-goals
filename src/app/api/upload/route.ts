import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: 'akvujdr3',
  api_key: '625182164196455',
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'couple-goals', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as { secure_url: string; public_id: string })
        },
      )
      uploadStream.end(buffer)
    })

    return Response.json({ url: result.secure_url, public_id: result.public_id })
  } catch (error) {
    return Response.json({ error: 'Upload failed', message: String(error) }, { status: 500 })
  }
}
