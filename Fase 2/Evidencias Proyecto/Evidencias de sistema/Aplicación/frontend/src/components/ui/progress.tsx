"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";
import { cn } from "./utils";

export function Progress({
  value = 0,
  showLabel = true,
  label,
  className,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  showLabel?: boolean;
  label?: string;
}) {
  const isIndeterminate = value === undefined || value === null;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Etiqueta y porcentaje */}
      {showLabel && (
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <span>{label || "Progreso"}</span>
          {!isIndeterminate && <span>{Math.round(value)}%</span>}
        </div>
      )}

      {/* Barra */}
      <ProgressPrimitive.Root
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full",
          "bg-gray-200 dark:bg-gray-800 shadow-inner border border-gray-300 dark:border-gray-700",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-in-out",
            "bg-blue-500"
          )}
          style={{
            width: isIndeterminate ? "100%" : `${value}%`,
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
