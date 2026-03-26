import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "outlined";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl",
        {
          "bg-white shadow-card p-5": variant === "default",
          "bg-soft-green p-5": variant === "soft",
          "bg-white border-2 border-gray-100 p-5": variant === "outlined",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
