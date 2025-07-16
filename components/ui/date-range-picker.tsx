"use client"

import React, { useState, forwardRef } from "react"
import DatePicker from "react-datepicker"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import "react-datepicker/dist/react-datepicker.css"

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onDateChange: (startDate: Date | null, endDate: Date | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

// Custom input component for the date picker
const CustomInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, disabled, placeholder }, ref) => (
  <Button
    variant="outline"
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    className="w-full justify-center text-center font-normal bg-white h-12 text-sm px-4 border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
    <span className="truncate">
      {value || placeholder || "Select dates"}
    </span>
  </Button>
))

CustomInput.displayName = "CustomInput"

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  disabled = false,
  placeholder = "Select dates",
  className = ""
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    onDateChange(start, end)
    
    // Close picker when both dates are selected
    if (start && end) {
      setIsOpen(false)
    }
  }

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
    } else if (startDate) {
      return `${format(startDate, "MMM dd")} - End date`
    }
    return ""
  }

  return (
    <div className={`relative ${className}`}>
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline={false}
        open={isOpen}
        onClickOutside={() => setIsOpen(false)}
        disabled={disabled}
        minDate={new Date()}
        monthsShown={2}
        customInput={
          <CustomInput 
            value={formatDateRange()} 
            placeholder={placeholder}
            disabled={disabled}
          />
        }
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        popperClassName="date-range-popper"
        calendarClassName="airbnb-calendar"
        dayClassName={(date) => {
          const today = new Date()
          const isToday = date.toDateString() === today.toDateString()
          const isPastDate = date < today
          
          if (isPastDate) return "past-date"
          if (isToday) return "today"
          return "available-date"
        }}
        popperProps={{
          strategy: "fixed"
        }}
      />
      
      <style jsx global>{`
        /* Airbnb-style calendar styling */
        .date-range-popper {
          z-index: 9999;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          border: none;
          overflow: hidden;
        }
        
        .airbnb-calendar {
          border: none;
          background: white;
          font-family: inherit;
          padding: 24px;
        }
        
        .react-datepicker__header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 0;
          border-radius: 0;
        }
        
        .react-datepicker__current-month {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
        }
        
        .react-datepicker__day-names {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .react-datepicker__day-name {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .react-datepicker__month {
          margin: 0;
          padding: 0;
        }
        
        .react-datepicker__week {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        
        .react-datepicker__day {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          margin: 0;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .react-datepicker__day:hover {
          background-color: #f3f4f6;
          border: 2px solid #d1d5db;
        }
        
        .react-datepicker__day--selected {
          background-color: #1f2937 !important;
          color: white !important;
          border: 2px solid #1f2937 !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range {
          background-color: #f1f5f9 !important;
          color: #1e293b !important;
          border: 2px solid #e2e8f0 !important;
        }
        
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #1f2937 !important;
          color: white !important;
          border: 2px solid #1f2937 !important;
          font-weight: 600 !important;
        }
        
        .today {
          background-color: #dbeafe;
          border: 2px solid #3b82f6;
          color: #1d4ed8;
          font-weight: 600;
        }
        
        .available-date {
          color: #111827;
        }
        
        .past-date {
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
        }
        
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
          border: 2px solid transparent !important;
        }
        
        .react-datepicker__navigation {
          background: none;
          border: none;
          outline: none;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }
        
        .react-datepicker__navigation:hover {
          background-color: #f3f4f6;
        }
        
        .react-datepicker__navigation--previous {
          left: 24px;
          top: 24px;
        }
        
        .react-datepicker__navigation--next {
          right: 24px;
          top: 24px;
        }
        
        .react-datepicker__month-container {
          margin: 0 12px;
        }
        
        .react-datepicker__month-container:first-child {
          margin-left: 0;
        }
        
        .react-datepicker__month-container:last-child {
          margin-right: 0;
        }
      `}</style>
    </div>
  )
}

export default DateRangePicker 