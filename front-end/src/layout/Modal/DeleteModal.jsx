import React, { useEffect } from 'react';
import './DeleteModal.css';
import { AlertTriangle } from "lucide-react";

function DeleteModal({isOpen, onClose, onConfirm}) {
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
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal')) {
            onClose();
        }
    };

    return (
        <div className="modal" onClick={handleOverlayClick}>
            <div className="modal-content">
                <AlertTriangle className="shield-icon" />
                <h2>Are you sure you want to delete this chat?</h2>
                <div className="button-group">
                    <button onClick={onClose} className="cancel">Cancel</button>
                    <button onClick={onConfirm} className="confirm">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;