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
      className={cn("p-6 bg-black/20 rounded-[2.5rem] border border-white/10", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-8 sm:gap-16 justify-center",
        month: "space-y-6 flex-1",
        month_caption: "flex justify-center pt-2 relative items-center mb-4",
        caption_label: "text-sm font-black uppercase tracking-[0.3em] text-white",
        nav: "flex items-center justify-between absolute w-full px-2 z-10 top-8",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white/5 border-white/10 p-0 text-white hover:bg-accent hover:text-black hover:border-accent transition-all"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white/5 border-white/10 p-0 text-white hover:bg-accent hover:text-black hover:border-accent transition-all"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-4",
        weekday:
          "text-white/20 w-10 font-black text-[0.65rem] uppercase tracking-widest text-center",
        week: "flex w-full mt-2 justify-between",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-bold transition-all rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
        ),
        selected: "bg-accent/20 rounded-xl",
        range_start: "day-range-start bg-accent !text-black rounded-xl shadow-[0_0_15px_rgba(224,176,80,0.5)]",
        range_end: "day-range-end bg-accent !text-black rounded-xl shadow-[0_0_15px_rgba(224,176,80,0.5)]",
        range_middle: "!bg-accent/15 !text-accent rounded-none",
        today: "text-accent font-black border border-accent/30 rounded-xl",
        outside: "opacity-10 pointer-events-none",
        disabled: "text-white/10 opacity-20 cursor-not-allowed line-through",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
