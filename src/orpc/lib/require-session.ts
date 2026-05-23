import type { Session } from '#/lib/auth'
import { ORPCError } from '@orpc/server'
import { auth } from '#/lib/auth'

export async function requireSession(headers: Headers): Promise<Session> {
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'You must be signed in.',
    })
  }

  return session
}
