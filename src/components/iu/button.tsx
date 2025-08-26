import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "link";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export default function Button({
  children,
  size = "md",
  variant = "default",
  className = "",
  icon,
  iconPosition = "left",
  ...props
}: ButtonProps) {
  // Base classes that apply to all buttons
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg",
  };
  
  // Variant classes
  const variantClasses = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-md hover:shadow-lg",
    ghost: "hover:bg-indigo-50 text-indigo-600",
    link: "text-indigo-600 underline-offset-4 hover:underline",
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}