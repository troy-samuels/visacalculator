"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import "./calendar-airbnb.css";

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
      className={cn("airbnb-calendar p-0 w-auto", className)}
      classNames={{
        months: "flex flex-row gap-16 justify-center airbnb-months",
        month: "space-y-6 min-w-0 airbnb-month",
        caption: "flex justify-center items-center mb-6 airbnb-caption relative",
        caption_label: "text-2xl font-bold text-gray-900 airbnb-caption-label",
        nav: "flex items-center airbnb-nav absolute w-full justify-between top-1 left-0 px-2",
        nav_button: cn(
          "h-10 w-10 bg-transparent hover:bg-gray-100 border-0 rounded-full flex items-center justify-center transition-all duration-200 text-gray-700 airbnb-nav-btn"
        ),
        nav_button_previous: "airbnb-nav-prev",
        nav_button_next: "airbnb-nav-next",
        table: "w-full border-collapse airbnb-table",
        head_row: "flex mb-2 airbnb-head-row",
        head_cell: "text-gray-500 font-semibold text-base text-center w-12 h-12 airbnb-head-cell",
        row: "flex w-full airbnb-row",
        cell: cn(
          "relative p-0 text-center text-base focus-within:relative focus-within:z-20 airbnb-cell",
          "[&:has([aria-selected])]:bg-transparent"
        ),
        day: cn(
          "h-12 w-12 p-0 font-medium relative rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-base airbnb-day",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        ),
        day_range_start: cn(
          "bg-black text-white rounded-full font-bold airbnb-range-start"
        ),
        day_range_end: cn(
          "bg-black text-white rounded-full font-bold airbnb-range-end"
        ),
        day_selected: cn(
          "bg-black text-white rounded-full font-bold airbnb-selected"
        ),
        day_today: "border-2 border-black text-black font-bold airbnb-today",
        day_outside: "text-gray-300 opacity-60 airbnb-outside",
        day_disabled: "text-gray-200 opacity-30 cursor-not-allowed airbnb-disabled",
        day_range_middle: cn(
          "bg-gray-100 text-black rounded-none airbnb-range-middle",
          "airbnb-range-middle-pill"
        ),
        day_hidden: "invisible airbnb-hidden",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-6 w-6 text-gray-700" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-6 w-6 text-gray-700" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
