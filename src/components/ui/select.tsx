import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Select trigger variants
const selectTriggerVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 text-sm",
        lg: "h-11 px-4 text-base"
      },
      variant: {
        default: "border-input",
        outline: "border-2 border-input",
        ghost: "border-transparent hover:border-input",
        filled: "bg-muted border-transparent"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

// Component interfaces
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectTriggerVariants> {
  value?: string
  defaultValue?: string
  placeholder?: string
  options: SelectOption[]
  onChange?: (value: string) => void
  disabled?: boolean
  searchable?: boolean
  multiple?: boolean
  maxHeight?: number
  loading?: boolean
  error?: boolean
}

export interface SelectTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof selectTriggerVariants> {
  disabled?: boolean
  error?: boolean
}

// Select context
const SelectContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedValue: string | string[] | undefined
  onSelect: (value: string) => void
  multiple?: boolean
  searchable?: boolean
} | null>(null)

// Main Select component
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    className,
    value,
    defaultValue,
    placeholder = "선택하세요",
    options,
    onChange,
    disabled = false,
    searchable = false,
    multiple = false,
    maxHeight = 300,
    loading = false,
    error = false,
    size,
    variant,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState<string | string[]>(
      multiple ? (defaultValue ? [defaultValue] : []) : (defaultValue || "")
    )
    const [searchQuery, setSearchQuery] = React.useState("")
    const selectRef = React.useRef<HTMLDivElement>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!searchable || !searchQuery) return options
      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }, [options, searchQuery, searchable])

    // Handle selection
    const handleSelect = React.useCallback((optionValue: string) => {
      let newValue: string | string[]
      
      if (multiple) {
        const currentArray = Array.isArray(selectedValue) ? selectedValue : []
        if (currentArray.includes(optionValue)) {
          newValue = currentArray.filter(v => v !== optionValue)
        } else {
          newValue = [...currentArray, optionValue]
        }
      } else {
        newValue = optionValue
        setIsOpen(false)
      }
      
      setSelectedValue(newValue)
      onChange?.(Array.isArray(newValue) ? newValue.join(',') : newValue)
    }, [selectedValue, multiple, onChange])

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchQuery("")
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when opened
    React.useEffect(() => {
      if (isOpen && searchable && searchRef.current) {
        searchRef.current.focus()
      }
    }, [isOpen, searchable])

    // Get display value
    const getDisplayValue = () => {
      if (multiple) {
        const selected = Array.isArray(selectedValue) ? selectedValue : []
        if (selected.length === 0) return placeholder
        if (selected.length === 1) {
          const option = options.find(opt => opt.value === selected[0])
          return option?.label || selected[0]
        }
        return `${selected.length}개 선택됨`
      }
      
      const option = options.find(opt => opt.value === selectedValue)
      return option?.label || placeholder
    }

    const contextValue = {
      isOpen,
      setIsOpen,
      selectedValue,
      onSelect: handleSelect,
      multiple,
      searchable
    }

    return (
      <SelectContext.Provider value={contextValue}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          <div ref={selectRef}>
            {/* Trigger */}
            <button
              type="button"
              className={cn(
                selectTriggerVariants({ size, variant }),
                error && "border-destructive focus:ring-destructive",
                disabled && "cursor-not-allowed opacity-50",
                isOpen && "ring-2 ring-ring ring-offset-2"
              )}
              disabled={disabled}
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
            >
              <span className="truncate">{getDisplayValue()}</span>
              <ChevronDown 
                className={cn(
                  "h-4 w-4 opacity-50 transition-transform",
                  isOpen && "rotate-180"
                )} 
              />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                {searchable && (
                  <div className="p-2 border-b">
                    <input
                      ref={searchRef}
                      type="text"
                      className="w-full h-8 px-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                )}
                
                <div 
                  className="py-1 overflow-auto"
                  style={{ maxHeight: `${maxHeight}px` }}
                  role="listbox"
                >
                  {loading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      로딩 중...
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                      {searchQuery ? "검색 결과가 없습니다" : "옵션이 없습니다"}
                    </div>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = multiple
                        ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                        : selectedValue === option.value

                      return (
                        <div
                          key={option.value}
                          className={cn(
                            "relative flex items-center px-3 py-2 text-sm cursor-pointer select-none hover:bg-accent hover:text-accent-foreground",
                            option.disabled && "cursor-not-allowed opacity-50",
                            isSelected && "bg-accent text-accent-foreground"
                          )}
                          onClick={() => !option.disabled && handleSelect(option.value)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {option.icon && (
                            <span className="mr-2 flex-shrink-0">{option.icon}</span>
                          )}
                          <div className="flex-1">
                            <div>{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

// Simple Select Trigger component for custom implementations
const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, size, variant, error, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        selectTriggerVariants({ size, variant }),
        error && "border-destructive focus:ring-destructive",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

export {
  Select,
  SelectTrigger,
  selectTriggerVariants,
  type SelectOption
}