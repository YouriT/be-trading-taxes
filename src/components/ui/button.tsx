import * as React from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent",
      ghost: "text-gray-600 hover:bg-gray-100 bg-transparent",
      danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <BaseButton
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);
Button.displayName = "Button";
