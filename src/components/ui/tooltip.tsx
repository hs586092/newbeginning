import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Tooltip variants
const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  {
    variants: {
      variant: {
        default: "bg-popover text-popover-foreground border-border",
        dark: "bg-gray-900 text-gray-100 border-gray-800",
        light: "bg-white text-gray-900 border-gray-200",
        accent: "bg-accent text-accent-foreground border-accent",
        destructive: "bg-destructive text-destructive-foreground border-destructive"
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// Tooltip position variants
const getTooltipPositionStyles = (side: TooltipSide, align: TooltipAlign) => {
  const positions = {
    top: {
      default: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      start: "bottom-full left-0 mb-2", 
      end: "bottom-full right-0 mb-2"
    },
    bottom: {
      default: "top-full left-1/2 -translate-x-1/2 mt-2",
      start: "top-full left-0 mt-2",
      end: "top-full right-0 mt-2"
    },
    left: {
      default: "right-full top-1/2 -translate-y-1/2 mr-2",
      start: "right-full top-0 mr-2",
      end: "right-full bottom-0 mr-2"
    },
    right: {
      default: "left-full top-1/2 -translate-y-1/2 ml-2",
      start: "left-full top-0 ml-2", 
      end: "left-full bottom-0 ml-2"
    }
  }
  
  return positions[side][align]
}

// Component interfaces
export type TooltipSide = "top" | "bottom" | "left" | "right"
export type TooltipAlign = "default" | "start" | "end"

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  content: React.ReactNode
  side?: TooltipSide
  align?: TooltipAlign
  disabled?: boolean
  delay?: number
  children: React.ReactNode
  asChild?: boolean
}

export interface TooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tooltipVariants> {
  side?: TooltipSide
  align?: TooltipAlign
}

// Tooltip context
const TooltipContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  side?: TooltipSide
  align?: TooltipAlign
} | null>(null)

// Main Tooltip component
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ 
    className,
    content,
    side = "top",
    align = "default", 
    disabled = false,
    delay = 200,
    variant,
    size,
    children,
    asChild = false,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const timeoutRef = React.useRef<NodeJS.Timeout>()
    const tooltipRef = React.useRef<HTMLDivElement>(null)

    // Show tooltip with delay
    const handleMouseEnter = React.useCallback(() => {
      if (disabled) return
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsOpen(true)
      }, delay)
    }, [disabled, delay])

    // Hide tooltip
    const handleMouseLeave = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsOpen(false)
    }, [])

    // Handle focus events for accessibility
    const handleFocus = React.useCallback(() => {
      if (disabled) return
      setIsOpen(true)
    }, [disabled])

    const handleBlur = React.useCallback(() => {
      setIsOpen(false)
    }, [])

    // Clean up timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    const contextValue = {
      isOpen,
      setIsOpen,
      side,
      align
    }

    const triggerProps = {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      "aria-describedby": isOpen ? "tooltip" : undefined
    }

    return (
      <TooltipContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative inline-block", className)}
          {...props}
        >
          {asChild ? (
            React.cloneElement(children as React.ReactElement, triggerProps)
          ) : (
            <div {...triggerProps}>
              {children}
            </div>
          )}
          
          {isOpen && !disabled && (
            <div
              ref={tooltipRef}
              role="tooltip"
              id="tooltip"
              className={cn(
                "absolute",
                getTooltipPositionStyles(side, align),
                tooltipVariants({ variant, size })
              )}
            >
              {content}
              {/* Arrow */}
              <div
                className={cn(
                  "absolute w-2 h-2 rotate-45 bg-inherit border-inherit",
                  side === "top" && align === "default" && "top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b",
                  side === "top" && align === "start" && "top-full left-2 -mt-1 border-r border-b",
                  side === "top" && align === "end" && "top-full right-2 -mt-1 border-r border-b",
                  side === "bottom" && align === "default" && "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t",
                  side === "bottom" && align === "start" && "bottom-full left-2 -mb-1 border-l border-t",
                  side === "bottom" && align === "end" && "bottom-full right-2 -mb-1 border-l border-t",
                  side === "left" && align === "default" && "left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r",
                  side === "left" && align === "start" && "left-full top-2 -ml-1 border-t border-r",
                  side === "left" && align === "end" && "left-full bottom-2 -ml-1 border-t border-r",
                  side === "right" && align === "default" && "right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l",
                  side === "right" && align === "start" && "right-full top-2 -mr-1 border-b border-l",
                  side === "right" && align === "end" && "right-full bottom-2 -mr-1 border-b border-l"
                )}
              />
            </div>
          )}
        </div>
      </TooltipContext.Provider>
    )
  }
)
Tooltip.displayName = "Tooltip"

// Tooltip Trigger component (for compound component pattern)
export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: cn(className, (children as React.ReactElement).props?.className)
      })
    }

    return (
      <div
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

// Tooltip Content component (for compound component pattern)
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side, align, variant, size, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    
    if (!context?.isOpen) return null

    const finalSide = side || context.side || "top"
    const finalAlign = align || context.align || "default"

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "absolute",
          getTooltipPositionStyles(finalSide, finalAlign),
          tooltipVariants({ variant, size }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipContent.displayName = "TooltipContent"

// Tooltip Provider for managing multiple tooltips
export interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
  skipDelayDuration?: number
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ 
  children,
  delayDuration = 200,
  skipDelayDuration = 300 
}) => {
  // You can implement global tooltip state here if needed
  return <>{children}</>
}

// Hook for programmatic tooltip control
export const useTooltip = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen)
  
  const open = React.useCallback(() => setIsOpen(true), [])
  const close = React.useCallback(() => setIsOpen(false), [])
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), [])
  
  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle
  }
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  tooltipVariants
}