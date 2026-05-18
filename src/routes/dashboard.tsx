import { createFileRoute, redirect } from '@tanstack/react-router'

import BetterAuthHeader from '#/integrations/better-auth/header-user'
import { getSession } from '#/lib/auth.functions'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return { session }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { session } = Route.useRouteContext()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-8 py-4 dark:border-neutral-800">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <BetterAuthHeader />
      </header>
      <main className="p-8">
        <p className="text-muted-foreground">
          Signed in as
          {' '}
          <span className="font-medium text-foreground">
            {session.user.phoneNumber ?? session.user.name}
          </span>
          {session.user.role && (
            <span className="ms-2 text-sm text-muted-foreground">
              (
              {session.user.role}
              )
            </span>
          )}
        </p>
      </main>
    </div>
  )
}
