/**
 * Object storage: MinIO (S3-compatible) on VPS.
 * Fallback: local filesystem (public/uploads) when MinIO is not available.
 */
import { promises as fs } from "fs"
import path from "path"
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

/** Fallback: save to public/uploads when MinIO is not running. URL will be /uploads/... */
export async function uploadToLocal(
  file: Buffer,
  fileName: string,
  folder = "uploads",
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const dir = path.join(process.cwd(), "public", "uploads", folder)
    await fs.mkdir(dir, { recursive: true })
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = path.join(dir, safeName)
    await fs.writeFile(filePath, file)
    const url = `/uploads/${folder}/${safeName}`
    return { success: true, url }
  } catch (e) {
    console.error("Local upload error:", e)
    return {
      success: false,
      error: e instanceof Error ? e.message : "Local save failed",
    }
  }
}

/** Delete a file stored via uploadToLocal (URL like /uploads/folder/file) */
export async function deleteFromLocal(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!fileUrl.startsWith("/uploads/")) return { success: false, error: "Not a local URL" }
    const relativePath = fileUrl.slice("/uploads/".length)
    const filePath = path.join(process.cwd(), "public", "uploads", relativePath)
    await fs.unlink(filePath)
    return { success: true }
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code === "ENOENT") return { success: true }
    console.error("Local delete error:", e)
    return { success: false, error: e instanceof Error ? e.message : "Delete failed" }
  }
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE }
