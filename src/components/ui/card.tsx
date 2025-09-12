import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Card variants for different use cases
const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "shadow-lg hover:shadow-xl hover:-translate-y-1 border-gray-200/60 bg-white/80 backdrop-blur-sm",
        elevated: "shadow-xl hover:shadow-2xl hover:-translate-y-2 border-gray-300/60 bg-white/90",
        interactive: "cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-2 border-gray-200/60 bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm transition-all duration-500",
        outline: "border-2 shadow-md hover:shadow-xl hover:-translate-y-1 bg-white/60 backdrop-blur-sm",
        ghost: "border-none shadow-none bg-transparent hover:bg-white/20 hover:backdrop-blur-sm",
        gradient: "bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200/60 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:from-pink-100 hover:to-purple-100",
        premium: "bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200/60 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]"
      },
      size: {
        default: "p-6",
        compact: "p-4",
        spacious: "p-8",
        none: "p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// Card component interfaces
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// Main Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

// Card Header component
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, compact = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        compact ? "p-4 pb-2" : "p-6 pb-0",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

// Card Title component
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h3", ...props }, ref) => (
    <Component
      ref={ref as any}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        "text-foreground",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

// Card Description component  
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

// Card Content component
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

// Card Footer component
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, compact = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        compact ? "p-4 pt-2" : "p-6 pt-0",
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
}