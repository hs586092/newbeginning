import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Card variants for different use cases
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow",
  {
    variants: {
      variant: {
        default: "hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg",
        interactive: "cursor-pointer hover:shadow-md hover:scale-[1.02] transition-transform",
        outline: "border-2 shadow-none hover:shadow-sm",
        ghost: "border-none shadow-none bg-transparent"
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