import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createId } from '@paralleldrive/cuid2'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const MAX_BYTES = 5 * 1024 * 1024

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function getProductUploadRoot() {
  return path.join(process.cwd(), 'public', 'uploads', 'products')
}

export function getProductImageDiskPath(publicPath: string) {
  const relative = publicPath.replace(/^\/uploads\//, 'uploads/')
  return path.join(process.cwd(), 'public', relative)
}

export function validateProductImageFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('فرمت تصویر مجاز نیست. از JPG، PNG، WebP یا GIF استفاده کنید.')
  }

  if (file.size > MAX_BYTES) {
    throw new Error('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.')
  }
}

export async function saveProductImageFile(productId: string, file: File) {
  validateProductImageFile(file)

  const extension = MIME_EXTENSION[file.type]
  if (!extension) {
    throw new Error('فرمت تصویر پشتیبانی نمی‌شود.')
  }

  const fileId = createId()
  const fileName = `${fileId}.${extension}`
  const dir = path.join(getProductUploadRoot(), productId)
  await mkdir(dir, { recursive: true })

  const diskPath = path.join(dir, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(diskPath, buffer)

  return {
    path: `/uploads/products/${productId}/${fileName}`,
  }
}

export async function deleteProductImageFile(publicPath: string) {
  const diskPath = getProductImageDiskPath(publicPath)

  try {
    await unlink(diskPath)
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}
