"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/app/lib/utils"

function Breadcrumb({
  ...props
}: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1 break-words text-xs text-slate-500 sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : Link
  return <Comp className={cn("transition-colors hover:text-blue-900", className)} {...props} />
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-current="page"
      className={cn("font-medium text-slate-700", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      aria-hidden="true"
      role="presentation"
      className={cn("[&>svg]:size-3", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
