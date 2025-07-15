"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-xl font-bold text-gray-900 tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-10 w-10 bg-transparent hover:bg-gray-100 border-0 rounded-full flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-gray-900"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-gray-500 rounded-md w-11 h-11 font-semibold text-sm text-center flex items-center justify-center uppercase tracking-wide",
        row: "flex w-full mt-1",
        cell: "h-11 w-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-11 w-11 p-0 font-medium relative rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-sm text-gray-900 hover:text-gray-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400",
          "disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white rounded-full font-semibold shadow-sm",
        day_today: "bg-gray-100 text-gray-900 font-bold rounded-full border-2 border-gray-900",
        day_outside:
          "day-outside text-gray-300 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30 hover:bg-gray-50 hover:text-gray-400",
        day_disabled: "text-gray-200 opacity-30 cursor-not-allowed hover:bg-transparent",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
