import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Key,
  Shield,
  Check,
  XCircle,
  Save,
  ChevronDown,
  RefreshCw,
  UserCog,
} from 'lucide-react';

const EditUserModal = ({ user, onClose, onSave, isSubmitting }) => {
  const [editingUser, setEditingUser] = useState({ ...user });
  const [fullApiKey, setFullApiKey] = useState(user.fullApiKey || '');
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isEmailVerificationDropdownOpen, setIsEmailVerificationDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = event => {
      if (isAdminDropdownOpen || isEmailVerificationDropdownOpen) {
        if (!event.target.closest('.custom-dropdown')) {
          setIsAdminDropdownOpen(false);
          setIsEmailVerificationDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdminDropdownOpen, isEmailVerificationDropdownOpen]);

  const handleModalOverlayClick = e => {
    if (e.target.classList.contains('edit-modal-overlay')) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave({ ...editingUser, apiKey: fullApiKey });
  };

  return (
    <div className="edit-modal-overlay" onClick={handleModalOverlayClick}>
      <div className="edit-modal">
        <h2>
          <UserCog size={20} /> Edit User
        </h2>
        <div className="form-group">
          <label>
            <User size={16} /> Username
          </label>
          <input
            type="text"
            value={editingUser.username}
            onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>
            <Mail size={16} /> Email
          </label>
          <input
            type="email"
            value={editingUser.email}
            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>
            <Key size={16} /> API Key
          </label>
          <input
            type="text"
            className="api-key-field"
            value={fullApiKey}
            onChange={e => setFullApiKey(e.target.value)}
            placeholder="No API key set"
          />
        </div>
        <div className="form-group">
          <label>
            <Shield size={16} /> Admin Status
          </label>
          <div className="custom-dropdown">
            <button
              className="dropdown-button"
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
              type="button"
            >
              {editingUser.isAdmin ? 'Admin' : 'User'} <ChevronDown size={16} />
            </button>
            {isAdminDropdownOpen && (
              <div className="dropdown-content">
                <ul>
                  <li
                    onClick={() => {
                      setEditingUser({ ...editingUser, isAdmin: false });
                      setIsAdminDropdownOpen(false);
                    }}
                  >
                    User
                  </li>
                  <li
                    onClick={() => {
                      setEditingUser({ ...editingUser, isAdmin: true });
                      setIsAdminDropdownOpen(false);
                    }}
                  >
                    Admin
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>
            <Check size={16} /> Email Verification
          </label>
          <div className="custom-dropdown">
            <button
              className="dropdown-button"
              onClick={() => setIsEmailVerificationDropdownOpen(!isEmailVerificationDropdownOpen)}
              type="button"
            >
              {editingUser.isEmailVerified ? 'Verified' : 'Unverified'} <ChevronDown size={16} />
            </button>
            {isEmailVerificationDropdownOpen && (
              <div className="dropdown-content">
                <ul>
                  <li
                    onClick={() => {
                      setEditingUser({ ...editingUser, isEmailVerified: false });
                      setIsEmailVerificationDropdownOpen(false);
                    }}
                  >
                    Unverified
                  </li>
                  <li
                    onClick={() => {
                      setEditingUser({ ...editingUser, isEmailVerified: true });
                      setIsEmailVerificationDropdownOpen(false);
                    }}
                  >
                    Verified
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal cancel-btn" onClick={onClose}>
            <XCircle size={18} /> Cancel
          </button>
          <button className="btn-modal save-btn" onClick={handleSave}>
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="icon-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
