import type { AdminProductImage } from '#/orpc/schemas/admin/products'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { cn } from '#/lib/utils'
import { orpc } from '#/orpc/client'

interface ProductImagesSectionProps {
  productId: string
  images: AdminProductImage[]
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function ProductImagesSection({
  productId,
  images,
}: ProductImagesSectionProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(nextPreviewUrl)

    return () => URL.revokeObjectURL(nextPreviewUrl)
  }, [selectedFile])

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: orpc.admin.products.get.key({ input: { id: productId } }),
    })
    await queryClient.invalidateQueries({
      queryKey: orpc.admin.products.list.key(),
    })
  }

  function selectFile(file: File | undefined) {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('فقط فایل تصویر انتخاب کنید.')
      return
    }

    setSelectedFile(file)
  }

  function resetUploadForm() {
    setSelectedFile(null)
    setAltText('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error('ابتدا یک تصویر انتخاب کنید.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (altText.trim()) {
        formData.append('alt', altText.trim())
      }

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
      resetUploadForm()
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>تصاویر محصول</CardTitle>
            <CardDescription>
              تصویر اول به‌عنوان کاور لیست محصول استفاده می‌شود.
            </CardDescription>
          </div>
          <Badge variant="outline">
            {images.length}
            {' '}
            تصویر
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            selectFile(event.target.files?.[0])
          }}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <button
            type="button"
            className={cn(
              'flex min-h-48 flex-col items-center justify-center gap-3 border border-dashed bg-muted/30 p-6 text-center transition-colors',
              dragActive && 'border-primary bg-primary/5',
            )}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setDragActive(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setDragActive(false)
              selectFile(event.dataTransfer.files[0])
            }}
          >
            <span className="flex size-11 items-center justify-center rounded-full border bg-background">
              <ImagePlus className="size-5" />
            </span>
            <span className="text-sm font-medium">
              تصویر را اینجا رها کنید یا انتخاب کنید
            </span>
            <span className="text-muted-foreground text-xs">
              JPG، PNG، WebP یا GIF تا ۵ مگابایت
            </span>
          </button>

          <div className="flex flex-col gap-3 border bg-background p-3">
            {previewUrl
              ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="aspect-square w-full border object-cover"
                  />
                )
              : (
                  <div className="text-muted-foreground flex aspect-square w-full items-center justify-center border bg-muted/30 text-sm">
                    پیش‌نمایش تصویر
                  </div>
                )}

            {selectedFile && (
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate font-medium" dir="ltr">
                  {selectedFile.name}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="product-image-alt">متن جایگزین تصویر</Label>
            <Input
              id="product-image-alt"
              value={altText}
              onChange={event => setAltText(event.target.value)}
              placeholder="مثلا Nike Air Max 90 نمای کنار"
            />
          </div>

          <Button
            type="button"
            disabled={uploading || !selectedFile}
            onClick={() => void handleUpload()}
          >
            {uploading
              ? <Loader2 className="animate-spin" />
              : <Upload />}
            {uploading ? 'در حال بارگذاری...' : 'بارگذاری تصویر'}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={uploading || (!selectedFile && !altText)}
            onClick={resetUploadForm}
          >
            <X />
            پاک کردن
          </Button>
        </div>

        {images.length === 0
          ? (
              <div className="border bg-muted/20 p-4 text-sm text-muted-foreground">
                هنوز تصویری بارگذاری نشده است.
              </div>
            )
          : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden border bg-muted"
                  >
                    <img
                      src={image.path}
                      alt={image.alt ?? ''}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="absolute start-2 top-2 flex gap-1">
                      {index === 0 && <Badge>کاور</Badge>}
                      <Badge variant="secondary">
                        {index + 1}
                      </Badge>
                    </div>
                    {image.alt && (
                      <div className="absolute inset-x-0 bottom-0 bg-background/90 p-2 text-xs">
                        {image.alt}
                      </div>
                    )}
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
