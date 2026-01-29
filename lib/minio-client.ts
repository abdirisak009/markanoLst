import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

/**
 * MinIO (S3-compatible) object storage for VPS.
 * Set in .env: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET, MINIO_PUBLIC_URL
 */
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000"
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin"
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin"
const MINIO_BUCKET = process.env.MINIO_BUCKET || "markano"
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || MINIO_ENDPOINT.replace(/:\d+$/, "") + "/" + MINIO_BUCKET

export const minioClient = new S3Client({
  region: "us-east-1",
  endpoint: MINIO_ENDPOINT,
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
})

export async function uploadToMinIO(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder = "uploads",
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const key = `${folder}/${Date.now()}-${fileName}`

    await minioClient.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    )

    const publicUrl = `${MINIO_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    return { success: true, url: publicUrl }
  } catch (error) {
    console.error("MinIO Upload Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" }
  }
}

export async function deleteFromMinIO(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const base = MINIO_PUBLIC_URL.replace(/\/$/, "")
    const key = fileUrl.startsWith(base + "/") ? fileUrl.slice(base.length + 1) : fileUrl.startsWith(base) ? fileUrl.slice(base.length).replace(/^\//, "") : fileUrl.replace(new RegExp("^.*/" + MINIO_BUCKET + "/"), "")
    if (!key) return { success: false, error: "Invalid URL" }

    await minioClient.send(
      new DeleteObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
      }),
    )
    return { success: true }
  } catch (error) {
    console.error("MinIO Delete Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Delete failed" }
  }
}

// Allowed file types (used by upload API and profile upload)
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
