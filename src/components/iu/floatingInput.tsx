"use client";

import React, { useState, useId } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (props, ref) => {
    const {
      label,
      type = "text",
      className = "",
      containerClassName = "",
      error,
      showPasswordToggle = type === "password",
      ...inputProps
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const id = useId();

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const showToggle = isPassword && showPasswordToggle;

    return (
      <div className={`relative ${containerClassName}`}>
        <input
          {...inputProps}
          ref={ref}
          id={inputProps.id || id}
          type={inputType}
          className={`
            peer block w-full rounded-md bg-white px-4 py-1.5 text-base text-gray-900 
            outline-1 -outline-offset-1 outline-gray-300 placeholder:text-transparent 
            focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
            ${(isFocused || hasValue) ? "pt-6 pb-1" : ""}
            ${className}
            ${showToggle ? "pr-10" : ""}
            ${error ? "outline-red-500 focus:outline-red-500" : ""}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          placeholder={label || inputProps.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        
        {(label || inputProps.placeholder) && (
        <label
          htmlFor={inputProps.id || id}
          className={`
            absolute left-4 transition-all duration-200 ease-in-out text-gray-400 
            pointer-events-none peer-focus:text-indigo-600
            ${isFocused || hasValue
              ? "top-1 text-xs text-indigo-600"
              : "top-1.5 text-sm"  
            }
            ${error ? "text-red-500 peer-focus:text-red-500" : ""}
          `}
        >
          {label || inputProps.placeholder}
        </label>
        )}
        
        {showToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
        
        {error && (
          <p 
            id={`${id}-error`}
            className="mt-1 text-sm text-red-600 absolute -bottom-5 left-0"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;