import React from 'react';
import './DeleteModal.css';
import {ShieldAlert} from "lucide-react";

function DeleteModal({isOpen, onClose, onConfirm}) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('modal')) {
            onClose();
        }
    }

    return (
        <div className="modal" onClick={handleOverlayClick}>
            <div className="modal-content">
                <ShieldAlert className="shield-icon"/>
                <h2>Are you sure you want to delete this chat?</h2>
                <div className="button-group">
                    <button onClick={onConfirm} className="confirm">Yes</button>
                    <button onClick={onClose} className="cancel">No</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;
