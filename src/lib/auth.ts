import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { phoneNumber } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { sendOtpSms } from '#/lib/send-otp'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  user: {
    additionalFields: {
      role: {
        type: ['admin', 'user', 'author'],
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber: phone, code }) => {
        sendOtpSms(phone, code)
      },
      signUpOnVerification: {
        getTempEmail: phone =>
          `${phone.replace(/\D/g, '')}@sneakstore.ir`,
        getTempName: phone => phone,
      },
    }),
    tanstackStartCookies(),
  ],
})
