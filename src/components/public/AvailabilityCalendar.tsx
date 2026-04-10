'use client'

import React, { useState } from 'react'
import { addDays, isSameDay, format, isBefore, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

interface AvailabilityCalendarProps {
  initialRange?: DateRange
  bookedDates?: Date[]
  onRangeSelect?: (range: DateRange | undefined) => void
  disabledDates?: Date[]
}

// Mock dates for UAT when DB is disconnected
const MOCK_BOOKED_DATES = [
  addDays(new Date(), 2),
  addDays(new Date(), 3),
  addDays(new Date(), 4),
  addDays(new Date(), 10),
  addDays(new Date(), 11),
]

export function AvailabilityCalendar({ 
  initialRange,
  bookedDates = MOCK_BOOKED_DATES, 
  onRangeSelect, 
  disabledDates = [] 
}: AvailabilityCalendarProps) {
  const [range, setRange] = useState<DateRange | undefined>(initialRange)
  const today = startOfToday()

  const handleSelect = (newRange: DateRange | undefined) => {
    // No react-day-picker v9, o primeiro clique define 'from' e 'to' como o mesmo dia.
    // Para manter a UX clássica (onde o primeiro clique é só check-in), 
    // ignoramos o 'to' se ele for igual ao 'from'.
    const normalized = (newRange?.from && newRange?.to && isSameDay(newRange.from, newRange.to))
      ? { from: newRange.from, to: undefined }
      : newRange

    setRange(normalized)
    if (onRangeSelect) {
      onRangeSelect(normalized)
    }
  }

  // Combine real booked dates with disabled dates and add logic to prevent selecting past dates
  const isDateDisabled = (date: Date) => {
    return (
      isBefore(date, today) ||
      bookedDates.some((bookedDate) => isSameDay(bookedDate, date)) ||
      disabledDates.some((disabledDate) => isSameDay(disabledDate, date))
    )
  }

  return (
    <div className="space-y-4 dark text-white">
      <div className="p-0 bg-transparent flex items-center justify-center">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          numberOfMonths={1}
          locale={ptBR}
          className="rounded-[2.5rem] border-0 bg-transparent shadow-none"
          classNames={{
            disabled: "opacity-10 cursor-not-allowed line-through",
          }}
        />
      </div>
      
      {range?.from && (
        <div className="flex items-center justify-between px-8 py-6 bg-accent/5 rounded-[2rem] border border-accent/10 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-accent/50">Período de Estadia</span>
            <div className="text-base font-black text-white flex items-center gap-2">
              {format(range.from, "dd 'de' MMM", { locale: ptBR })}
              {range.to && (
                <>
                  <span className="text-accent/30">—</span>
                  {format(range.to, "dd 'de' MMM", { locale: ptBR })}
                </>
              )}
            </div>
          </div>
          {range.to && range.from.getTime() !== range.to.getTime() && (
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-accent/50">Total</span>
              <div className="text-2xl font-black text-accent tracking-tighter">
                {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))}
                <span className="text-xs ml-1 uppercase text-white/40 tracking-normal">Noites</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
