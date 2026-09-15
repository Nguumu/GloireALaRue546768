import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-surface-300 bg-white px-3 text-sm text-surface-900",
          "placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
          "dark:border-surface-700 dark:bg-surface-900 dark:text-surface-50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";
