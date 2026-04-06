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
  Link,
  Hr,
} from '@react-email/components'

interface BookingConfirmationProps {
  guestName: string
  propertyName: string
  checkIn: string
  checkOut: string
  totalPrice: number
  bookingId: string
}

export const BookingConfirmation = ({
  guestName = 'Hóspede',
  propertyName = 'Sua Hospedagem',
  checkIn = '2026-06-01',
  checkOut = '2026-06-10',
  totalPrice = 0,
  bookingId = '---',
}: BookingConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Confirmação de Reserva: {propertyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reserva Confirmada!</Heading>
        <Text style={text}>Olá <strong>{guestName}</strong>,</Text>
        <Text style={text}>
          Tudo pronto! Sua estadia na <strong>{propertyName}</strong> foi confirmada com sucesso.
        </Text>
        
        <Section style={detailsArea}>
          <Text style={detailsTitle}>Detalhes da Reserva #{bookingId.substring(0, 8).toUpperCase()}</Text>
          <Text style={detailsText}>
            <strong>Check-In:</strong> {checkIn}<br />
            <strong>Check-Out:</strong> {checkOut}<br />
            <strong>Total Pago:</strong> {(totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          Prepare as malas e aproveite muito seu tempo conosco. Se tiver qualquer dúvida, nosso proprietário entrará em contato via WhatsApp.
        </Text>

        <Text style={footer}>
          Enviado com carinho por <strong>HostSemImposto</strong>.
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
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
}

const h1 = {
  color: '#0071e3',
  fontSize: '24px',
  fontWeight: '900',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
}

const detailsArea = {
  backgroundColor: '#f4f7fa',
  padding: '24px',
  borderRadius: '12px',
  marginTop: '24px',
}

const detailsTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 10px 0',
}

const detailsText = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '22px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '30px',
}

export default BookingConfirmation
