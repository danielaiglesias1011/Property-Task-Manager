import { useState, useCallback } from 'react';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const useModal = () => {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: ''
  });

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      type: options?.type || 'danger'
    });
  }, []);

  const showAlert = useCallback((
    title: string,
    message: string,
    options?: {
      type?: 'success' | 'error' | 'warning' | 'info';
      autoClose?: boolean;
      autoCloseDelay?: number;
    }
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type: options?.type || 'success',
      autoClose: options?.autoClose,
      autoCloseDelay: options?.autoCloseDelay
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    closeConfirm();
  }, [confirmModal.onConfirm, closeConfirm]);

  return {
    confirmModal,
    alertModal,
    showConfirm,
    showAlert,
    closeConfirm,
    closeAlert,
    handleConfirm
  };
};
