import React, { ReactNode } from "react";

interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
  return <div className="space-y-3">{children}</div>;
}
