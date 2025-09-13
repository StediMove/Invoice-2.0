'use client'

import { motion } from "framer-motion"
import { forwardRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
  children: ReactNode
  animationNum: number
  timelineRef: React.RefObject<HTMLElement>
  customVariants?: any
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export const TimelineContent = forwardRef<HTMLElement, TimelineContentProps>(
  ({ children, animationNum, timelineRef, customVariants, className, as = "div", ...props }, ref) => {
    const Component = motion[as as keyof typeof motion] as any

    const defaultVariants = {
      visible: (i: number) => ({
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          delay: i * 0.4,
          duration: 0.5,
        },
      }),
      hidden: {
        filter: "blur(10px)",
        y: -20,
        opacity: 0,
      },
    }

    return (
      <Component
        ref={ref}
        custom={animationNum}
        initial="hidden"
        whileInView="visible"
        variants={customVariants || defaultVariants}
        viewport={{ once: true }}
        className={cn(className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

TimelineContent.displayName = "TimelineContent"