import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHomePage,
})

function DashboardHomePage() {
  const { session } = Route.useRouteContext()

  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold">Welcome back</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as
        {' '}
        <span className="font-medium text-foreground">
          {session.user.phoneNumber ?? session.user.name}
        </span>
        {session.user.role && (
          <span className="ms-2 capitalize text-muted-foreground">
            (
            {session.user.role}
            )
          </span>
        )}
      </p>
    </div>
  )
}
