import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface PasswordResetProps {
  resetUrl: string
  email: string
}

export const PasswordReset = ({
  resetUrl = 'https://hostsemimposto.com/reset-password?token=TOKEN&email=EMAIL',
  email = 'usuario@exemplo.com',
}: PasswordResetProps) => (
  <Html>
    <Head />
    <Preview>Redefinição de senha solicitada para {email}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoArea}>
          <div style={logoMark} />
        </Section>

        <Heading style={h1}>Redefinição de Senha</Heading>

        <Text style={text}>
          Recebemos uma solicitação para redefinir a senha da conta associada a <strong>{email}</strong>.
        </Text>

        <Text style={text}>
          Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.
        </Text>

        <Section style={buttonContainer}>
          <Button href={resetUrl} style={buttonStyle}>
            Redefinir minha senha
          </Button>
        </Section>

        <Hr style={hr} />

        <Text style={warning}>
          Se você não solicitou essa redefinição, ignore este e-mail. Sua senha permanece inalterada e nenhuma ação é necessária.
        </Text>

        <Text style={footer}>
          Por segurança, este link é de uso único e expira em 1 hora.
          <br />
          <strong>HostSemImposto</strong> — Premium Hosting Platform
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '16px',
  maxWidth: '560px',
}

const logoArea = {
  marginBottom: '32px',
}

const logoMark = {
  width: '48px',
  height: '4px',
  backgroundColor: '#0071e3',
  borderRadius: '2px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '900',
  margin: '0 0 24px 0',
  letterSpacing: '-0.5px',
}

const text = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
}

const buttonContainer = {
  margin: '32px 0',
}

const buttonStyle = {
  backgroundColor: '#0071e3',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '14px 28px',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const warning = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0 0 24px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  marginTop: '24px',
}

export default PasswordReset
