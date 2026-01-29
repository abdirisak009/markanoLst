/**
 * Object storage: MinIO (S3-compatible) on VPS.
 * All uploads (instructor profile images, general uploads) use MinIO.
 */
import {
  uploadToMinIO,
  deleteFromMinIO,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/minio-client"

export async function uploadToStorage(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder = "uploads",
): Promise<{ success: boolean; url?: string; error?: string }> {
  return uploadToMinIO(file, fileName, contentType, folder)
}

export async function deleteFromStorage(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  return deleteFromMinIO(fileUrl)
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE }
