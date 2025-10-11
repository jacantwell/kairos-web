import React, { ReactNode } from "react";

interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <div className="mt-6 flex gap-3">{children}</div>;
}
