import { ReactNode } from "react";

interface FormErrorProps {
  children: ReactNode;
  className?: string;
}

export function FormError({ children, className = "" }: FormErrorProps) {
  if (!children) return null;

  return (
    <div
      className={`text-red-800 text-sm flex items-center gap-2 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 3a1 1 0 00-.993.883L9 10v3a1 1 0 001.993.117L11 13v-3a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}
