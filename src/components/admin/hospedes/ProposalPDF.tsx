import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'black',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#666',
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  gridItem: {
    width: '45%',
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#999',
  },
  accent: {
    color: '#A88B46', // Assuming accent color
  }
})

interface ProposalPDFProps {
  guestName: string
  propertyName: string
  dates: string
  totalValue: number
}

export const ProposalPDF = ({ guestName, propertyName, dates, totalValue }: ProposalPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>HOSTSI</Text>
        <Text style={{ fontSize: 10, color: '#999' }}>PROPOSTA COMERCIAL #{Math.floor(Math.random() * 10000)}</Text>
      </View>

      {/* Main Title */}
      <View style={styles.section}>
        <Text style={styles.title}>Proposta de <Text style={styles.accent}>Hospedagem</Text></Text>
        <Text style={{ fontSize: 12, color: '#333' }}>Olá, {guestName}. Verificamos sua solicitação e preparamos esta oferta especial para você.</Text>
      </View>

      <View style={{ height: 40 }} />

      {/* Details Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Imóvel Selecionado</Text>
          <Text style={styles.value}>{propertyName}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Período Solicitado</Text>
          <Text style={styles.value}>{dates}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Check-in / Check-out</Text>
          <Text style={styles.value}>A partir das 14h / Até 11h</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Total da Proposta</Text>
          <Text style={[styles.value, { fontSize: 24, marginTop: 4 }]}>
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </View>
      </View>

      <View style={{ height: 60 }} />

      {/* Terms */}
      <View style={styles.section}>
        <Text style={styles.label}>Condições de Pagamento</Text>
        <Text style={{ fontSize: 11, lineHeight: 1.5, color: '#444' }}>
          • Reserva confirmada mediante pagamento do valor total via Stripe (Cartão ou PIX).{"\n"}
          • Limpeza profissional inclusa na tarifa básica.{"\n"}
          • Proposta válida por 48 horas a partir da data de envio.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>NetLife HostSemImposto — Gestão de Ativos Imobiliários</Text>
        <Text style={styles.footerText}>Página 1 de 1</Text>
      </View>
    </Page>
  </Document>
)
