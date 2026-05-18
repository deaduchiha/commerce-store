import { redirect } from '@tanstack/react-router'

import { getSession } from '#/lib/auth.functions'

export async function dashboardBeforeLoad() {
  const session = await getSession()

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return { session }
}
