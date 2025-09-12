import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "./optimized-image"

// Avatar variants for different sizes and styles
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm", 
        default: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
        "3xl": "h-24 w-24 text-3xl"
      },
      variant: {
        default: "border-border bg-muted",
        ring: "ring-2 ring-ring ring-offset-2 ring-offset-background",
        soft: "border-2 border-background shadow-sm",
        outline: "border-2 border-border bg-background"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

// Avatar fallback variants
const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        colorful: "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
        initials: "bg-primary text-primary-foreground",
        icon: "bg-secondary text-secondary-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

// Component interfaces
export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarFallbackVariants> {}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: VariantProps<typeof avatarVariants>["size"]
  spacing?: "tight" | "normal" | "loose"
}

// Main Avatar component
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(avatarVariants({ size, variant }), className)}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

// Avatar Image component
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)

    const handleError = React.useCallback(() => {
      setHasError(true)
      setIsLoading(false)
    }, [])

    const handleLoad = React.useCallback(() => {
      setIsLoading(false)
    }, [])

    if (hasError) {
      return null // Let fallback show
    }

    return (
      <OptimizedImage
        ref={ref as any}
        src={src}
        alt={alt}
        className={cn(
          "aspect-square h-full w-full object-cover",
          isLoading && "animate-pulse bg-muted",
          className
        )}
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 768px) 100px, 200px"
        priority={false}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

// Avatar Fallback component
const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(avatarFallbackVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"

// Avatar Group component for showing multiple avatars
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 4, size = "default", spacing = "normal", ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const visibleAvatars = childrenArray.slice(0, max)
    const remainingCount = childrenArray.length - max

    const spacingClasses = {
      tight: "-space-x-1",
      normal: "-space-x-2", 
      loose: "-space-x-1"
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center", spacingClasses[spacing], className)}
        {...props}
      >
        {visibleAvatars.map((child, index) =>
          React.cloneElement(child as React.ReactElement, {
            key: index,
            size,
            className: cn(
              "ring-2 ring-background",
              (child as React.ReactElement).props?.className
            ),
            style: { zIndex: max - index }
          })
        )}
        {remainingCount > 0 && (
          <Avatar size={size} variant="outline" className="ring-2 ring-background">
            <AvatarFallback variant="default">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

// Utility function to generate initials from name
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Utility function to generate avatar color from string
export const generateAvatarColor = (str: string): string => {
  const colors = [
    "from-red-400 to-red-600",
    "from-blue-400 to-blue-600", 
    "from-green-400 to-green-600",
    "from-yellow-400 to-yellow-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
    "from-orange-400 to-orange-600"
  ]
  
  const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  avatarVariants,
  avatarFallbackVariants
}