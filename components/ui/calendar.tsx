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
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-8 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center mb-6",
        caption_label: "text-lg font-semibold text-gray-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "flex mb-3",
        head_cell: "text-gray-500 rounded-md w-11 h-11 font-medium text-xs text-center flex items-center justify-center uppercase tracking-wide",
        row: "flex w-full",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-gray-100",
          "[&:has([aria-selected].day-outside)]:bg-gray-50",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "[&:has([aria-selected].day-range-start)]:rounded-l-full",
          "first:[&:has([aria-selected])]:rounded-l-full",
          "last:[&:has([aria-selected])]:rounded-r-full"
        ),
        day: cn(
          "h-11 w-11 p-0 font-normal relative rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
          "disabled:text-gray-300 disabled:hover:bg-transparent"
        ),
        day_range_start: cn(
          "bg-gray-900 text-white hover:bg-gray-800 focus:bg-gray-800 rounded-full font-medium shadow-sm",
          "before:absolute before:inset-0 before:rounded-full before:bg-gray-900"
        ),
        day_range_end: cn(
          "bg-gray-900 text-white hover:bg-gray-800 focus:bg-gray-800 rounded-full font-medium shadow-sm",
          "before:absolute before:inset-0 before:rounded-full before:bg-gray-900"
        ),
        day_selected: cn(
          "bg-gray-900 text-white hover:bg-gray-800 focus:bg-gray-800 rounded-full font-medium shadow-sm",
          "before:absolute before:inset-0 before:rounded-full before:bg-gray-900"
        ),
        day_today: "bg-white border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-50",
        day_outside: "text-gray-300 opacity-60 hover:bg-gray-50 hover:text-gray-400",
        day_disabled: "text-gray-200 opacity-40 cursor-not-allowed hover:bg-transparent",
        day_range_middle: cn(
          "bg-gray-100 text-gray-900 hover:bg-gray-200 rounded-none",
          "aria-selected:bg-gray-100 aria-selected:text-gray-900"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-gray-600" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-gray-600" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
