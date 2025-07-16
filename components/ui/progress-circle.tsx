"use client"

import { useState, useEffect } from "react"

interface ProgressCircleProps {
  daysRemaining: number
  size?: number
}

export function ProgressCircle({ daysRemaining, size = 120 }: ProgressCircleProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const maxDays = 90
  const percentage = Math.max(0, Math.min(100, (daysRemaining / maxDays) * 100))

  useEffect(() => {
    const startProgress = animatedProgress
    const targetProgress = percentage
    const startTime = Date.now()
    const duration = 800

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentProgress = startProgress + (targetProgress - startProgress) * easeOutQuart

      setAnimatedProgress(currentProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [percentage, animatedProgress])

  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  const getColor = () => {
    if (daysRemaining <= 15) return "#ef4444" // Red
    if (daysRemaining <= 30) return "#f59e0b" // Amber
    return "#10b981" // Green
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-bold text-gray-900">
          {daysRemaining}
        </div>
        <div className="text-xs text-gray-600 font-medium">
          {daysRemaining === 1 ? "day" : "days"}
        </div>
        <div className="text-xs text-gray-500">
          remaining
        </div>
      </div>
    </div>
  )
} 