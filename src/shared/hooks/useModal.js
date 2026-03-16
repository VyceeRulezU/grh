import { useState } from 'react';

/**
 * useModal - shared hook for showing in-app StatusModal alerts.
 * 
 * Usage:
 *   const { modal, showModal, closeModal } = useModal();
 * 
 *   showModal({
 *     title: 'Error',
 *     message: 'Something went wrong.',
 *     icon: 'ri-close-circle-line',
 *     iconColor: '#ef4444',
 *     iconBg: '#fef2f2',
 *     onConfirm: () => { ... }  // optional — defaults to close
 *   });
 *
 *   // In JSX:
 *   <StatusModal {...modal} onConfirm={modal.onConfirm} onCancel={closeModal} confirmLabel="OK" cancelLabel="Close" />
 */
export function useModal() {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: 'ri-information-line',
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
    onConfirm: null,
  });

  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

  const showModal = ({
    title,
    message,
    icon = 'ri-information-line',
    iconColor = '#3b82f6',
    iconBg = '#eff6ff',
    onConfirm,
  }) => {
    setModal({
      isOpen: true,
      title,
      message,
      icon,
      iconColor,
      iconBg,
      onConfirm: onConfirm || closeModal,
    });
  };

  // Helpers for common alert types
  const showSuccess = (title, message, onConfirm) =>
    showModal({ title, message, icon: 'ri-checkbox-circle-line', iconColor: '#22c55e', iconBg: '#f0fdf4', onConfirm });

  const showError = (title, message, onConfirm) =>
    showModal({ title, message, icon: 'ri-close-circle-line', iconColor: '#ef4444', iconBg: '#fef2f2', onConfirm });

  const showWarning = (title, message, onConfirm) =>
    showModal({ title, message, icon: 'ri-error-warning-line', iconColor: '#f59e0b', iconBg: '#fffbeb', onConfirm });

  const showInfo = (title, message, onConfirm) =>
    showModal({ title, message, icon: 'ri-information-line', iconColor: '#3b82f6', iconBg: '#eff6ff', onConfirm });

  return { modal, showModal, closeModal, showSuccess, showError, showWarning, showInfo };
}
