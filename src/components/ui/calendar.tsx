"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 pt-12 bg-black/20 rounded-[2.5rem] border border-white/10 relative", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-12 sm:gap-20 justify-center",
        month: "space-y-8 flex-1",
        month_caption: "flex justify-center pt-2 relative items-center mb-6",
        caption_label: "text-base font-black uppercase tracking-[0.4em] text-white",
        nav: "flex items-center justify-between absolute h-12 w-full left-0 top-6 px-10 z-20 pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-white/5 border-white/10 p-0 text-white hover:bg-accent hover:text-black hover:border-accent transition-all rounded-full pointer-events-auto shadow-lg"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 bg-white/5 border-white/10 p-0 text-white hover:bg-accent hover:text-black hover:border-accent transition-all rounded-full pointer-events-auto shadow-lg"
        ),
        month_grid: "w-full border-collapse mx-auto",
        weekdays: "flex justify-between mb-6",
        weekday:
          "text-white/20 w-12 font-black text-[0.7rem] uppercase tracking-widest text-center",
        week: "flex w-full mt-3 justify-between",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-12 w-12 p-0 font-bold transition-all rounded-2xl text-white/60 hover:bg-white/10 hover:text-white text-base"
        ),
        selected: "bg-accent/20 rounded-2xl",
        range_start: "day-range-start !bg-accent !text-black rounded-2xl shadow-[0_0_20px_rgba(224,176,80,0.6)] z-10 scale-110 font-black",
        range_end: "day-range-end !bg-accent !text-black rounded-2xl shadow-[0_0_20px_rgba(224,176,80,0.6)] z-10 scale-110 font-black",
        range_middle: "!bg-accent/15 !text-accent rounded-none opacity-90",
        today: "text-accent font-black border-2 border-accent/30 rounded-2xl",
        outside: "opacity-5 pointer-events-none grayscale",
        disabled: "text-white/10 opacity-20 cursor-not-allowed line-through",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-5 w-5" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
