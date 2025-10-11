import { InputHTMLAttributes, forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-4 py-3 border placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 sm:text-sm transition-colors";
    const normalClasses =
      "border-gray-300 focus:ring-primary-green-500 focus:border-primary-green-500";
    const errorClasses =
      "border-red-800 ring-1 ring-red-800 focus:ring-red-800 focus:border-red-800";
    const disabledClasses = "bg-gray-50 text-gray-500 cursor-not-allowed";

    const classes = `${baseClasses} ${
      error ? errorClasses : normalClasses
    } ${props.disabled ? disabledClasses : ""} ${className}`;

    return <input ref={ref} className={classes} {...props} />;
  }
);

FormInput.displayName = "FormInput";