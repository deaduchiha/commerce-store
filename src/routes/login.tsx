import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: sendError } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phoneNumber.trim(),
    })

    setLoading(false)

    if (sendError) {
      setError(sendError.message ?? 'Failed to send code')
      return
    }

    setStep('otp')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: verifyError } = await authClient.phoneNumber.verify({
      phoneNumber: phoneNumber.trim(),
      code: code.trim(),
    })

    setLoading(false)

    if (verifyError) {
      setError(verifyError.message ?? 'Invalid code')
      return
    }

    await navigate({ to: '/' })
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your phone number. We&apos;ll send you a one-time code.
        </p>
      </div>

      {step === 'phone'
        ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+989121234567"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send code'}
              </Button>
            </form>
          )
        : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep('phone')
                  setCode('')
                  setError(null)
                }}
              >
                Change phone number
              </Button>
            </form>
          )}
    </div>
  )
}
