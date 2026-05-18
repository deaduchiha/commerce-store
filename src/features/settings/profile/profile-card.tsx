import type { Profile, UpdateProfileInput } from '#/orpc/schemas/profile'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { FormStatus } from '#/features/settings/components/form-status'
import { ProfileFormFields } from '#/features/settings/profile/profile-form-fields'
import { orpc } from '#/orpc/client'
import { updateProfileInputSchema } from '#/orpc/schemas/profile'

function ProfileCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )
}

interface LoadedProfileCardProps {
  profile: Profile
}

function LoadedProfileCard({ profile }: LoadedProfileCardProps) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation(
    orpc.profile.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.profile.get.key(),
        })
        toast.success('تغییرات با موفقیت ذخیره شد.')
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: profile.name,
    } satisfies UpdateProfileInput,
    validators: {
      onChange: updateProfileInputSchema,
      onBlur: updateProfileInputSchema,
      onSubmit: updateProfileInputSchema,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>پروفایل</CardTitle>
        <CardDescription>
          نام نمایشی خود را ویرایش کنید.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <CardContent className="flex flex-col gap-5">
          <ProfileFormFields
            form={form}

          />
          <FormStatus
            errorMessage={
              updateMutation.isError
                ? updateMutation.error.message ?? 'ذخیره‌سازی ناموفق بود.'
                : null
            }
          />
        </CardContent>
        <CardFooter className="border-t-0 bg-transparent">
          <Button
            type="submit"
            disabled={updateMutation.isPending || !form.state.canSubmit}
          >
            {updateMutation.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function ProfileCard() {
  const profileQuery = useQuery(orpc.profile.get.queryOptions())

  if (profileQuery.isPending) {
    return <ProfileCardSkeleton />
  }

  if (profileQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>پروفایل</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            بارگذاری پروفایل ناموفق بود.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <LoadedProfileCard
      key={`${profileQuery.data.id}-${profileQuery.data.name}`}
      profile={profileQuery.data}
    />
  )
}
