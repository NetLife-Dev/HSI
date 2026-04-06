import { Resend } from 'resend'
import { ReactNode } from 'react'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  // Graceful degradation for dev/UAT
  console.warn('Missing RESEND_API_KEY. Email sending will be skipped.')
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendEmail({
  to,
  subject,
  react,
  from = process.env.AUTH_FROM_EMAIL || 'HostSemImposto <noreply@yourdomain.com>',
}: {
  to: string | string[]
  subject: string
  react: ReactNode
  from?: string
}) {
  if (!resend) {
    console.warn(`[Email Skip] To: ${to}, Subject: ${subject}`)
    return { id: 'skipped' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react: react as any,
    })

    if (error) {
      console.error('[Resend Error]', error)
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error('[Email Send Failed]', err)
    throw err
  }
}
