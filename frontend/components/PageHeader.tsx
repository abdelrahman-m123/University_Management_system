import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "@/app/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageHeaderBreadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  showTitle?: boolean;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  breadcrumbs?: PageHeaderBreadcrumb[];
  sticky?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  showTitle = true,
  description,
  eyebrow,
  actions,
  tabs,
  breadcrumbs,
  sticky = true,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        sticky ? "sticky top-0 z-20 bg-slate-50/95 backdrop-blur" : "relative z-10",
        "-mx-4 -mt-4 mb-8 border-b border-slate-200 px-4 pt-4 pb-0 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8",
        className
      )}
    >
      <div className="w-full">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => {
                const isCurrent = index === breadcrumbs.length - 1;

                return (
                  <React.Fragment key={`${breadcrumb.label}-${index}`}>
                    <BreadcrumbItem>
                      {isCurrent || !breadcrumb.href ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild href={breadcrumb.href}>
                          <a href={breadcrumb.href}>{breadcrumb.label}</a>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isCurrent && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex min-w-0 flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-blue-900">
                {eyebrow}
              </p>
            )}
            {showTitle && <h1 className="truncate text-2xl font-bold text-slate-900">{title}</h1>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>}
        </div>
        {tabs && (
          <div className="w-full max-w-full -mb-px overflow-x-auto">
            {tabs}
          </div>
        )}
      </div>
    </header>
  );
}
