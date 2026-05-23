import type { UserRole } from '#/lib/roles'

import { redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.functions'
import { satisfiesRoleRequirement } from '#/lib/roles'

export async function requireAuthBeforeLoad() {
  const session = await getSession()

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return { session }
}

interface RoleGuardOptions {
  /** Where to send users who are signed in but lack permission. */
  forbiddenTo?: '/dashboard' | '/login'
  /** When true, only listed roles match (admin does not satisfy `author`). */
  exact?: boolean
}

/**
 * Route `beforeLoad` guard — requires sign-in and a minimum role (or exact role).
 *
 * @example
 * beforeLoad: requireRoleBeforeLoad('admin')
 * beforeLoad: requireRoleBeforeLoad(['author', 'admin'], { exact: true })
 */
export function requireRoleBeforeLoad(
  requirement: UserRole | readonly UserRole[],
  options: RoleGuardOptions = {},
) {
  const { forbiddenTo = '/dashboard', exact = false } = options

  return async () => {
    const { session } = await requireAuthBeforeLoad()
    const role = session.user.role

    const allowed = satisfiesRoleRequirement(role, requirement, { exact })

    if (!allowed) {
      throw redirect({ to: forbiddenTo })
    }

    return { session }
  }
}
