import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Alert variants
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5",
        warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400"
      },
      size: {
        default: "p-4",
        sm: "p-3 text-sm",
        lg: "p-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// Component interfaces
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  autoClose?: boolean
  autoCloseDelay?: number
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// Default icons for each variant
const getDefaultIcon = (variant: string) => {
  switch (variant) {
    case 'destructive':
      return <AlertCircle className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'success':
      return <CheckCircle2 className="h-4 w-4" />
    case 'info':
      return <Info className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

// Main Alert component
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = "default",
    size = "default",
    dismissible = false,
    onDismiss,
    icon,
    autoClose = false,
    autoCloseDelay = 5000,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    
    // Auto close functionality
    React.useEffect(() => {
      if (autoClose && autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onDismiss?.()
        }, autoCloseDelay)
        
        return () => clearTimeout(timer)
      }
    }, [autoClose, autoCloseDelay, onDismiss])

    // Handle dismiss
    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
      onDismiss?.()
    }, [onDismiss])

    if (!isVisible) return null

    const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant || "default")

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        {displayIcon}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className={cn(dismissible && "pr-8")}>{children}</div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

// Alert Title component
const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

// Alert Description component
const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

// Alert hook for programmatic usage
export interface UseAlertOptions {
  variant?: VariantProps<typeof alertVariants>["variant"]
  duration?: number
  dismissible?: boolean
}

export const useAlert = () => {
  const [alerts, setAlerts] = React.useState<Array<{
    id: string
    title?: string
    description: string
    variant: VariantProps<typeof alertVariants>["variant"]
    dismissible: boolean
    duration?: number
  }>>([])

  const addAlert = React.useCallback((
    description: string,
    options: UseAlertOptions = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newAlert = {
      id,
      description,
      variant: options.variant || "default",
      dismissible: options.dismissible ?? true,
      duration: options.duration
    }

    setAlerts(prev => [...prev, newAlert])

    // Auto remove if duration is set
    if (options.duration) {
      setTimeout(() => {
        removeAlert(id)
      }, options.duration)
    }

    return id
  }, [])

  const removeAlert = React.useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const clearAlerts = React.useCallback(() => {
    setAlerts([])
  }, [])

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    // Convenience methods
    success: (description: string, options?: Omit<UseAlertOptions, 'variant'>) =>
      addAlert(description, { ...options, variant: 'success' }),
    error: (description: string, options?: Omit<UseAlertOptions, 'variant'>) =>
      addAlert(description, { ...options, variant: 'destructive' }),
    warning: (description: string, options?: Omit<UseAlertOptions, 'variant'>) =>
      addAlert(description, { ...options, variant: 'warning' }),
    info: (description: string, options?: Omit<UseAlertOptions, 'variant'>) =>
      addAlert(description, { ...options, variant: 'info' })
  }
}

// Alert Container for displaying multiple alerts
export interface AlertContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxAlerts?: number
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ 
  position = 'top-right',
  maxAlerts = 5 
}) => {
  const { alerts, removeAlert } = useAlert()

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50'
  }

  const visibleAlerts = alerts.slice(-maxAlerts)

  if (visibleAlerts.length === 0) return null

  return (
    <div className={cn(positionClasses[position], "space-y-2 max-w-md")}>
      {visibleAlerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          dismissible={alert.dismissible}
          onDismiss={() => removeAlert(alert.id)}
          autoClose={!!alert.duration}
          autoCloseDelay={alert.duration}
        >
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export {
  Alert,
  AlertTitle,
  AlertDescription,
  alertVariants
}