"use client";
import React, { createContext, useContext, useState } from "react";
import AuthModal from "../components/AuthModal";

type ContextShape = {
  openModal: () => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<ContextShape>({
  openModal: () => {},
  closeModal: () => {},
});

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AuthModal open={open} onClose={closeModal} />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
