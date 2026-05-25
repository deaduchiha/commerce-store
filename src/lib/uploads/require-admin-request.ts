import { auth } from '#/lib/auth.server'
import { hasMinRole } from '#/lib/roles'

export async function requireAdminRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return { error: Response.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  if (!hasMinRole(session.user.role, 'admin')) {
    return { error: Response.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { session }
}
