import type { Session } from '#/lib/auth'
import { requireMinRole } from '#/orpc/lib/require-role'

export async function requireAdmin(headers: Headers): Promise<Session> {
  return requireMinRole(headers, 'admin')
}
