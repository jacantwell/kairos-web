import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  children: ReactNode;
}

export function Modal({ isOpen, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        {children}
      </div>
    </div>
  );
}

import { ModalHeader } from "./modal-header";
import { ModalBody } from "./modal-body";
import { ModalFooter } from "./modal-footer";

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
