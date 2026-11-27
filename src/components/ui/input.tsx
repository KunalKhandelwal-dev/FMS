import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-[#202638] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#202638] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:cursor-not-allowed disabled:bg-[#F1F3F9] disabled:opacity-60",
            error && "border-[#E11D48] focus:ring-[#E11D48]",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#E11D48]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
