import { TextareaHTMLAttributes, forwardRef } from "react";

interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-3 py-2 border placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 sm:text-sm transition-colors";
    const normalClasses =
      "border-gray-300 focus:ring-primary-green-500 focus:border-primary-green-500";
    const errorClasses =
      "border-red-300 focus:ring-red-500 focus:border-red-500";
    const disabledClasses = "bg-gray-50 text-gray-500 cursor-not-allowed";

    const classes = `${baseClasses} ${
      error ? errorClasses : normalClasses
    } ${props.disabled ? disabledClasses : ""} ${className}`;

    return <textarea ref={ref} className={classes} {...props} />;
  }
);

FormTextarea.displayName = "FormTextarea";