import type { Session } from '#/lib/auth.types'
import { requireMinRole } from '#/orpc/lib/require-role'

export async function requireAdmin(headers: Headers): Promise<Session> {
  return requireMinRole(headers, 'admin')
}
