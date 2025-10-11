import { ReactNode } from "react";

interface FormHelpTextProps {
  children: ReactNode;
  className?: string;
}

export function FormHelpText({ children, className = "" }: FormHelpTextProps) {
  return (
    <p className={`text-xs text-gray-500 mt-1 ${className}`}>{children}</p>
  );
}