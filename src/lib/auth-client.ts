import {
  inferAdditionalFields,
  phoneNumberClient,
} from 'better-auth/client/plugins'

import { createAuthClient } from 'better-auth/react'
import { USER_ROLES } from '#/lib/roles'

export const authClient = createAuthClient({
  plugins: [
    phoneNumberClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'user',
          input: false,
          enum: [...USER_ROLES],
        },
      },
    }),
  ],
})
