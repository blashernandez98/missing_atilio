'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop - blocks all interaction */}
      <div className="fixed inset-0 bg-black/60" onClick={onClose}></div>

      {/* Modal container - centers content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative z-[10000] w-full max-w-sm sm:max-w-md">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
