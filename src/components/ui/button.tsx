import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

    const variantStyles = {
      primary: "bg-[#4F46E5] text-white hover:bg-[#4338CA] focus:ring-[#4F46E5]",
      secondary: "bg-[#F1F3F9] text-[#202638] hover:bg-slate-200/80 focus:ring-slate-300",
      outline:
        "border border-[#E5E7EB] text-[#202638] bg-white hover:bg-[#F7F8FC] focus:ring-indigo-500",
      ghost: "text-[#64748B] hover:bg-[#F1F3F9] hover:text-[#202638] focus:ring-slate-300",
      danger: "bg-[#E11D48] text-white hover:bg-rose-700 focus:ring-[#E11D48]",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
