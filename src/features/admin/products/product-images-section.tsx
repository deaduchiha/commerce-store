import type { AdminProductImage } from '#/orpc/schemas/admin/products'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { orpc } from '#/orpc/client'

interface ProductImagesSectionProps {
  productId: string
  images: AdminProductImage[]
}

export function ProductImagesSection({
  productId,
  images,
}: ProductImagesSectionProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: orpc.admin.products.get.key({ input: { id: productId } }),
    })
    await queryClient.invalidateQueries({
      queryKey: orpc.admin.products.list.key(),
    })
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `/api/admin/products/${productId}/images`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        },
      )

      if (!response.ok) {
        const data = (await response.json()) as { message?: string }
        throw new Error(data.message ?? 'Upload failed')
      }

      await invalidate()
      toast.success('تصویر اضافه شد.')
    }
    catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'بارگذاری تصویر انجام نشد.',
      )
    }
    finally {
      setUploading(false)
    }
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId)
    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId }),
        },
      )

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      await invalidate()
      toast.success('تصویر حذف شد.')
    }
    catch {
      toast.error('حذف تصویر انجام نشد.')
    }
    finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تصاویر محصول</CardTitle>
        <CardDescription>
          تصاویر در گالری فروشگاه نمایش داده می‌شوند. حذف از اینجا فایل را از
          سرور هم پاک می‌کند.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              void handleUpload(file)
            }
            e.target.value = ''
          }}
        />

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? <Loader2 className="animate-spin" />
            : <ImagePlus />}
          افزودن تصویر
        </Button>

        {images.length === 0
          ? (
              <p className="text-muted-foreground text-sm">
                هنوز تصویری بارگذاری نشده است.
              </p>
            )
          : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map(image => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={image.path}
                      alt={image.alt ?? ''}
                      className="aspect-square w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute end-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                      disabled={deletingId === image.id}
                      onClick={() => void handleDelete(image.id)}
                    >
                      {deletingId === image.id
                        ? <Loader2 className="animate-spin" />
                        : <Trash2 />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
      </CardContent>
    </Card>
  )
}
