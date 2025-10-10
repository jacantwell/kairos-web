"use client"

import {
  createContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ModalType = string | null;

export interface ModalState {
  type: ModalType;   // e.g. "createJourney", "userMarker"
  props?: any;       // optional props passed to modal
}

interface ModalContextValue {
  modal: ModalState;
  openModal: (type: string, props?: any) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined
);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ type: null });

  const openModal = useCallback((type: string, props?: any) => {
    setModal({ type, props });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ type: null });
  }, []);

  return (
    <ModalContext.Provider value={{ modal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}
