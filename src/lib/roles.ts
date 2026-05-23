import { z } from 'zod'

/** Single source of truth — keep in sync with Drizzle `user.role` and better-auth `additionalFields`. */
export const USER_ROLES = ['admin', 'user', 'author'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const userRoleSchema = z.enum(USER_ROLES)

/** Higher rank inherits lower-tier access (admin → author → user). */
const ROLE_RANK: Record<UserRole, number> = {
  user: 0,
  author: 1,
  admin: 2,
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole)
}

export function hasMinRole(
  userRole: unknown,
  minimum: UserRole,
): boolean {
  if (!isUserRole(userRole)) {
    return false
  }

  return ROLE_RANK[userRole] >= ROLE_RANK[minimum]
}

/** Exact role match only (no inheritance). */
export function hasExactRole(
  userRole: unknown,
  allowed: UserRole | readonly UserRole[],
): boolean {
  if (!isUserRole(userRole)) {
    return false
  }

  const allowedList = Array.isArray(allowed) ? allowed : [allowed]
  return allowedList.includes(userRole)
}

export function satisfiesRoleRequirement(
  userRole: unknown,
  requirement: UserRole | readonly UserRole[],
  options: { exact?: boolean } = {},
): boolean {
  const { exact = false } = options
  const roles = Array.isArray(requirement) ? requirement : [requirement]

  if (exact) {
    return hasExactRole(userRole, roles)
  }

  return roles.some(r => hasMinRole(userRole, r))
}
