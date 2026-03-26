import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-primary-500 text-white hover:bg-primary-600 shadow-md": variant === "primary",
            "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50": variant === "secondary",
            "bg-transparent text-gray-500 hover:bg-gray-100": variant === "ghost",
            "bg-red-400 text-white hover:bg-red-500": variant === "danger",
          },
          {
            "text-sm px-3 py-2": size === "sm",
            "text-base px-5 py-3": size === "md",
            "text-lg px-6 py-4": size === "lg",
            "text-xl px-8 py-5": size === "xl",
          },
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
