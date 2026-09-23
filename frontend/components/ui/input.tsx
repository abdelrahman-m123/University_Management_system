import * as React from "react"

import { cn } from "../../app/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        "w-full min-w-0 rounded-md border bg-white px-3 py-1 text-sm text-foreground shadow-xs",
        // Height
        "h-9",
        // Border
        "border-blue-200",
        // Placeholder
        "placeholder:text-slate-400",
        // Focus
        "outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-0",
        // Transitions
        "transition-[border-color,box-shadow] duration-150",
        // File input
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid
        "aria-invalid:border-red-400 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
