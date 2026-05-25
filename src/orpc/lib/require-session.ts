import type { Session } from '#/lib/auth.types'
import { ORPCError } from '@orpc/server'
import { auth } from '#/lib/auth.server'

export async function requireSession(headers: Headers): Promise<Session> {
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'You must be signed in.',
    })
  }

  return session
}
