import type { Session } from '#/lib/auth.types'
import type { UserRole } from '#/lib/roles'
import { ORPCError } from '@orpc/server'
import { satisfiesRoleRequirement } from '#/lib/roles'
import { requireSession } from '#/orpc/lib/require-session'

interface RoleRequirementOptions {
  exact?: boolean
}

function assertRole(
  session: Session,
  requirement: UserRole | readonly UserRole[],
  options: RoleRequirementOptions,
) {
  const { exact = false } = options
  const role = session.user.role

  if (!satisfiesRoleRequirement(role, requirement, { exact })) {
    throw new ORPCError('FORBIDDEN', {
      message: 'You do not have permission to perform this action.',
    })
  }
}

/** Requires a signed-in session with at least `minimum` role (admin satisfies author/user). */
export async function requireMinRole(
  headers: Headers,
  minimum: UserRole,
): Promise<Session> {
  const session = await requireSession(headers)
  assertRole(session, minimum, { exact: false })
  return session
}

/** Requires a signed-in session whose role is exactly one of `allowed`. */
export async function requireExactRole(
  headers: Headers,
  allowed: UserRole | readonly UserRole[],
): Promise<Session> {
  const session = await requireSession(headers)
  assertRole(session, allowed, { exact: true })
  return session
}
