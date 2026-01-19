import React, { useEffect, useRef } from 'react';
import './DeleteModal.css';
import { AlertTriangle } from 'lucide-react';

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete',
  message = 'Are you sure you want to delete this item?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
}) {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target.classList.contains('modal')) {
      onClose();
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Tab') {
      // Simple focus trap - keep focus within modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return (
    <div
      className="modal"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="modal-content" ref={modalRef} tabIndex={-1} onKeyDown={handleKeyDown}>
        <AlertTriangle className="shield-icon" aria-hidden="true" />
        <h2 id="modal-title">{title}</h2>
        <p id="modal-description">{message}</p>
        <div className="button-group">
          <button
            onClick={onClose}
            className="cancel"
            disabled={isLoading}
            aria-label={`${cancelText} - Close this dialog`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="confirm"
            ref={confirmButtonRef}
            disabled={isLoading}
            aria-label={`${confirmText} - This action cannot be undone`}
          >
            {isLoading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
