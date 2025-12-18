import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = "3d1b18c2d945425cecef4f47bedb43c6"
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "84900d87c757552746d56725a7c3090c"
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY || "3b614f708f63cf5590d4cfa6516f447264720d9d4cb6a41573bdb235f125b668"
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "markano"
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-59e08c1a67df410f99a38170fbd4a247.r2.dev"

// Create S3 client for R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// Upload file to R2
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder = "uploads",
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const key = `${folder}/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    await r2Client.send(command)

    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("R2 Upload Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" }
  }
}

// Delete file from R2
export async function deleteFromR2(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract key from URL
    const key = fileUrl.replace(`${R2_PUBLIC_URL}/`, "")

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)

    return { success: true }
  } catch (error) {
    console.error("R2 Delete Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Delete failed" }
  }
}

// Get file types allowed
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
