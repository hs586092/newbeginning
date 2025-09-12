import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Tabs variants
const tabsVariants = cva("", {
  variants: {
    orientation: {
      horizontal: "flex flex-col",
      vertical: "flex flex-row"
    }
  },
  defaultVariants: {
    orientation: "horizontal"
  }
})

// Tabs list variants
const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "bg-transparent border-b border-border p-0",
        pills: "bg-muted/50 gap-1",
        cards: "bg-transparent border-b border-border p-0 gap-2"
      },
      size: {
        sm: "h-8 text-xs",
        default: "h-10 text-sm",
        lg: "h-11 text-base"
      },
      orientation: {
        horizontal: "w-full",
        vertical: "flex-col w-48"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      orientation: "horizontal"
    }
  }
)

// Tabs trigger variants  
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        line: "rounded-none border-b-2 border-transparent bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
        pills: "rounded-md bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        cards: "rounded-t-md border border-b-0 border-transparent bg-transparent hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground"
      },
      size: {
        sm: "h-6 px-2 text-xs",
        default: "h-8 px-3 text-sm", 
        lg: "h-10 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// Component interfaces
export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

export interface TabsTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string
  disabled?: boolean
  badge?: string | number
  icon?: React.ReactNode
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  forceMount?: boolean
}

// Tabs context
const TabsContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: string
  size?: string
} | null>(null)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs compound components must be used within Tabs")
  }
  return context
}

// Main Tabs component
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, defaultValue, onValueChange, orientation = "horizontal", children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const currentValue = value ?? internalValue
    
    const handleValueChange = React.useCallback((newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [value, onValueChange])

    const contextValue = {
      value: currentValue,
      onValueChange: handleValueChange,
      orientation
    }

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(tabsVariants({ orientation }), className)}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

// Tabs List component
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, size, orientation, ...props }, ref) => {
    const { orientation: contextOrientation } = useTabsContext()
    const finalOrientation = orientation || contextOrientation

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={finalOrientation}
        className={cn(
          tabsListVariants({ variant, size, orientation: finalOrientation }),
          className
        )}
        {...props}
      />
    )
  }
)
TabsList.displayName = "TabsList"

// Tabs Trigger component
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, badge, icon, variant, size, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext()
    const isActive = selectedValue === value
    
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabs-content-${value}`}
        data-state={isActive ? "active" : "inactive"}
        className={cn(tabsTriggerVariants({ variant, size }), className)}
        disabled={disabled}
        onClick={() => !disabled && onValueChange?.(value)}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        <span className="flex items-center gap-2">
          {children}
          {badge && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground min-w-[1.25rem] h-5">
              {badge}
            </span>
          )}
        </span>
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

// Tabs Content component
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()
    const isActive = selectedValue === value
    
    if (!isActive && !forceMount) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabs-content-${value}`}
        aria-labelledby={`tabs-trigger-${value}`}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !isActive && forceMount && "hidden",
          className
        )}
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

// Utility hook for tabs management
export const useTabs = (defaultValue?: string) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || "")
  
  const switchTab = React.useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  const isActive = React.useCallback((value: string) => {
    return activeTab === value
  }, [activeTab])

  return {
    activeTab,
    switchTab,
    isActive,
    setActiveTab
  }
}

// Advanced Tabs with lazy loading
export interface LazyTabsProps extends TabsProps {
  lazyLoad?: boolean
  preloadNextTab?: boolean
}

export const LazyTabs = React.forwardRef<HTMLDivElement, LazyTabsProps>(
  ({ lazyLoad = false, preloadNextTab = false, children, ...props }, ref) => {
    const [loadedTabs, setLoadedTabs] = React.useState<Set<string>>(new Set())
    
    const handleValueChange = React.useCallback((value: string) => {
      if (lazyLoad) {
        setLoadedTabs(prev => new Set([...prev, value]))
      }
      props.onValueChange?.(value)
    }, [lazyLoad, props.onValueChange])

    // Initialize with default value
    React.useEffect(() => {
      if (lazyLoad && props.defaultValue) {
        setLoadedTabs(prev => new Set([...prev, props.defaultValue!]))
      }
    }, [lazyLoad, props.defaultValue])

    const modifiedChildren = React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === TabsContent) {
        const shouldLoad = !lazyLoad || loadedTabs.has(child.props.value)
        return shouldLoad ? child : null
      }
      return child
    })

    return (
      <Tabs
        ref={ref}
        {...props}
        onValueChange={handleValueChange}
      >
        {modifiedChildren}
      </Tabs>
    )
  }
)
LazyTabs.displayName = "LazyTabs"

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants
}