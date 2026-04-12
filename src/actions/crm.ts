'use server'

import { db } from '@/db'
import { financialTransactions, crmLeads, bookings } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function convertLeadToReservation(leadId: string, data: {
  guestName: string
  property: string
  value: number
  checkIn: string // simplified for demo
  checkOut: string
}) {
  try {
    // In a real app we would update the lead status in DB and create a booking
    // For this UAT session, we'll simulate the financial impact
    
    // 1. Create financial entry
    await db.insert(financialTransactions).values({
      type: 'income',
      amount: data.value,
      category: 'Entrada',
      description: `Reserva CRM - ${data.guestName} (${data.property})`,
      date: new Date().toISOString().split('T')[0],
    })

    // 2. We would also update CRM leads status but since the page uses MOCK for now, 
    // we just return success to trigger UI feedback.

    revalidatePath('/admin/financeiro')
    revalidatePath('/admin/hospedes')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
