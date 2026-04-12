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
      className={cn("p-3 sm:p-4 pt-12 sm:pt-16 bg-black/40 rounded-[2rem] sm:rounded-[3rem] border border-white/5 relative", className)}
      classNames={{
        months: "w-full flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center",
        month: "space-y-6 sm:space-y-8 flex-1",
        month_caption: "flex justify-center relative items-center mb-6 sm:mb-10",
        caption_label: "text-sm sm:text-base font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/90",
        nav: "flex items-center justify-between absolute h-10 sm:h-12 w-full left-0 top-4 sm:top-6 px-4 sm:px-6 z-20 pointer-events-none",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 sm:h-10 sm:w-10 bg-white/5 border-white/10 p-0 text-white hover:bg-accent hover:text-black hover:border-accent transition-all rounded-full pointer-events-auto backdrop-blur-sm"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 sm:h-10 sm:w-10 bg-white/5 border-white/10 p-0 text-white hover:bg-accent hover:text-black hover:border-accent transition-all rounded-full pointer-events-auto backdrop-blur-sm"
        ),
        month_grid: "w-full border-collapse space-y-1 sm:space-y-2 mx-auto",
        weekdays: "flex w-full justify-between items-center mb-4 sm:mb-6 px-0 sm:px-1 opacity-50",
        weekday:
          "text-white w-8 sm:w-10 font-black text-[0.5rem] sm:text-[0.6rem] uppercase tracking-widest text-center",
        week: "flex w-full mt-1 sm:mt-2 justify-between",
        day: "relative p-0 text-center text-xs sm:text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 sm:h-12 sm:w-12 p-0 font-bold transition-all rounded-lg sm:rounded-2xl text-white/40 hover:bg-white/5 hover:text-white text-xs sm:text-sm"
        ),
        selected: "bg-accent/20 rounded-lg sm:rounded-2xl",
        range_start: "day-range-start !bg-accent !text-black rounded-lg sm:rounded-2xl shadow-[0_0_20px_rgba(224,176,80,0.3)] z-10 scale-105 sm:scale-110 font-black",
        range_end: "day-range-end !bg-accent !text-black rounded-lg sm:rounded-2xl shadow-[0_0_20px_rgba(224,176,80,0.3)] z-10 scale-105 sm:scale-110 font-black",
        range_middle: "!bg-accent/10 !text-accent rounded-none",
        today: "text-accent font-black border-2 border-accent/20 rounded-lg sm:rounded-2xl",
        outside: "opacity-0 pointer-events-none grayscale",
        disabled: "text-white/5 opacity-10 cursor-not-allowed line-through grayscale font-normal",
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
