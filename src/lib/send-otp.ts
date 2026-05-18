/**
 * Sends OTP via SMS. Replace with Twilio, AWS SNS, etc. in production.
 * Do not await in sendOTP — Better Auth recommends fire-and-forget to avoid timing attacks.
 */
export function sendOtpSms(phoneNumber: string, code: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[OTP] ${phoneNumber} → ${code}`)
    return
  }

  // TODO: integrate your SMS provider (Twilio, etc.)
  console.warn(`[OTP] SMS not configured; code for ${phoneNumber}: ${code}`)
}
