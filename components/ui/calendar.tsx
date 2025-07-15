"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div 
      className={cn("calendar-airbnb-container p-6 bg-white rounded-2xl shadow-sm", className)}
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
        fontSize: "16px",
      }}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="calendar-airbnb-picker"
        classNames={{
          months: "calendar-months flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "calendar-month space-y-4",
          caption: "calendar-caption flex justify-center pt-2 relative items-center mb-6",
          caption_label: "calendar-caption-label text-2xl font-bold text-gray-900 tracking-tight",
          nav: "calendar-nav space-x-1 flex items-center",
          nav_button: "calendar-nav-button h-12 w-12 bg-transparent hover:bg-gray-100 border-0 rounded-full flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-gray-900",
          nav_button_previous: "calendar-nav-prev absolute left-2",
          nav_button_next: "calendar-nav-next absolute right-2",
          table: "calendar-table w-full border-collapse mt-4",
          head_row: "calendar-head-row flex mb-3",
          head_cell: "calendar-head-cell text-gray-500 rounded-md w-14 h-14 font-semibold text-sm text-center flex items-center justify-center uppercase tracking-wide",
          row: "calendar-row flex w-full mt-1",
          cell: "calendar-cell h-14 w-14 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 rounded-full",
          day: "calendar-day h-14 w-14 p-0 font-medium relative rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-base text-gray-900 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed border-0 bg-transparent",
          day_range_start: "calendar-day-range-start",
          day_range_end: "calendar-day-range-end",
          day_selected: "calendar-day-selected bg-gray-900 text-white hover:bg-gray-800 hover:text-white focus:bg-gray-900 focus:text-white rounded-full font-semibold shadow-sm border-0",
          day_today: "calendar-day-today bg-gray-100 text-gray-900 font-bold rounded-full border-2 border-gray-900",
          day_outside: "calendar-day-outside text-gray-300 opacity-50 hover:bg-gray-50 hover:text-gray-400",
          day_disabled: "calendar-day-disabled text-gray-200 opacity-30 cursor-not-allowed hover:bg-transparent",
          day_range_middle: "calendar-day-range-middle",
          day_hidden: "calendar-day-hidden invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-6 w-6" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-6 w-6" />,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
