'use client'

import React, { useState } from 'react'
import { addDays, isSameDay, format, isBefore, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

interface AvailabilityCalendarProps {
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
  bookedDates = MOCK_BOOKED_DATES, 
  onRangeSelect, 
  disabledDates = [] 
}: AvailabilityCalendarProps) {
  const [range, setRange] = useState<DateRange | undefined>()
  const today = startOfToday()

  const handleSelect = (newRange: DateRange | undefined) => {
    setRange(newRange)
    if (onRangeSelect) {
      onRangeSelect(newRange)
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
    <div className="space-y-4 dark text-white overflow-x-auto">
      <div className="p-4 bg-transparent flex items-center justify-center">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          numberOfMonths={2}
          locale={ptBR}
          className="rounded-3xl"
          classNames={{
            disabled: "opacity-10 cursor-not-allowed line-through",
          }}
        />
      </div>
      
      {range?.from && (
        <div className="flex items-center justify-between px-6 py-4 bg-accent/10 rounded-2xl border border-accent/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-accent/60">Período Selecionado</span>
            <div className="text-sm font-bold text-white">
              {format(range.from, "dd 'de' MMM", { locale: ptBR })}
              {range.to && ` — ${format(range.to, "dd 'de' MMM", { locale: ptBR })}`}
            </div>
          </div>
          {range.to && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-black tracking-widest text-accent/60">Noites</span>
              <div className="text-lg font-black text-accent">
                {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
