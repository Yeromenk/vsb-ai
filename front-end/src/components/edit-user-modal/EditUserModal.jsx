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
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const EditUserModal = ({ user, onClose, onSave, isSubmitting }) => {
  const [editingUser, setEditingUser] = useState({ ...user });
  const [fullApiKey, setFullApiKey] = useState(user.fullApiKey || '');
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isEmailVerificationDropdownOpen, setIsEmailVerificationDropdownOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(!!user.fullApiKey);
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!editingUser.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (editingUser.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editingUser.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(editingUser.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (fullApiKey && fullApiKey.length < 10) {
      newErrors.apiKey = 'API key seems too short';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (isAdminDropdownOpen || isEmailVerificationDropdownOpen) {
        if (!event.target.closest('.dropdown-container')) {
          setIsAdminDropdownOpen(false);
          setIsEmailVerificationDropdownOpen(false);
        }
      }
    };

    const handleEscape = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAdminDropdownOpen, isEmailVerificationDropdownOpen, onClose]);

  // Keep local API key state in sync if parent passes a different key later
  useEffect(() => {
    setFullApiKey(user.fullApiKey || '');
    if (user.fullApiKey) setShowApiKey(true);
  }, [user.fullApiKey]);

  const handleModalOverlayClick = e => {
    if (e.target.classList.contains('edit-modal-overlay')) {
      onClose();
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({ ...editingUser, apiKey: fullApiKey });
    }
  };

  const handleInputChange = (field, value) => {
    setEditingUser({ ...editingUser, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Match ApiKeySetup signature (event) and behavior
  const handleApiKeyChange = e => {
    setFullApiKey(e.target.value);
    if (errors.apiKey) {
      setErrors({ ...errors, apiKey: '' });
    }
  };

  const toggleApiKeyVisibility = () => setShowApiKey(prev => !prev);

  const getAdminStatusText = () => {
    return editingUser.isAdmin ? 'Admin' : 'User';
  };

  const getEmailStatusText = () => {
    return editingUser.isEmailVerified ? 'Verified' : 'Unverified';
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
            onChange={e => handleInputChange('username', e.target.value)}
            className={errors.username ? 'error' : ''}
            aria-label="Username"
          />
          {errors.username && (
            <div className="error-message">
              <AlertCircle size={14} />
              {errors.username}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>
            <Mail size={16} /> Email
          </label>
          <input
            type="email"
            value={editingUser.email}
            onChange={e => handleInputChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
            aria-label="Email"
          />
          {errors.email && (
            <div className="error-message">
              <AlertCircle size={14} />
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>
            <Key size={16} /> API Key
          </label>
          <div className="input-container">
            <Key size={20} className="icon-api" />
            <input
              className={`api-key-input ${errors.apiKey ? 'error' : ''}`}
              type={showApiKey ? 'text' : 'password'}
              placeholder="Enter your OpenAI API key"
              value={fullApiKey}
              onChange={handleApiKeyChange}
              aria-label="API Key"
              autoComplete="off"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={toggleApiKeyVisibility}
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
              title={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.apiKey && (
            <div className="error-message">
              <AlertCircle size={14} />
              {errors.apiKey}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>
            <Shield size={16} /> Admin Status
          </label>
          <div className="dropdown-container">
            <div
              className={`dropdown-header ${isAdminDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            >
              <div className="dropdown-header-text">
                <Shield size={16} />
                {getAdminStatusText()}
              </div>
              <ChevronDown size={16} className={isAdminDropdownOpen ? 'rotated' : ''} />
            </div>
            {isAdminDropdownOpen && (
              <div className="dropdown-list-container">
                <ul className="dropdown-list">
                  <li
                    className={`dropdown-list-item ${!editingUser.isAdmin ? 'selected' : ''}`}
                    onClick={() => {
                      setEditingUser({ ...editingUser, isAdmin: false });
                      setIsAdminDropdownOpen(false);
                    }}
                  >
                    <User size={16} />
                    User
                  </li>
                  <li
                    className={`dropdown-list-item ${editingUser.isAdmin ? 'selected' : ''}`}
                    onClick={() => {
                      setEditingUser({ ...editingUser, isAdmin: true });
                      setIsAdminDropdownOpen(false);
                    }}
                  >
                    <Shield size={16} />
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
          <div className="dropdown-container">
            <div
              className={`dropdown-header ${isEmailVerificationDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsEmailVerificationDropdownOpen(!isEmailVerificationDropdownOpen)}
            >
              <div className="dropdown-header-text">
                {editingUser.isEmailVerified ? <Check size={16} /> : <XCircle size={16} />}
                {getEmailStatusText()}
              </div>
              <ChevronDown size={16} className={isEmailVerificationDropdownOpen ? 'rotated' : ''} />
            </div>
            {isEmailVerificationDropdownOpen && (
              <div className="dropdown-list-container">
                <ul className="dropdown-list">
                  <li
                    className={`dropdown-list-item ${!editingUser.isEmailVerified ? 'selected' : ''}`}
                    onClick={() => {
                      setEditingUser({ ...editingUser, isEmailVerified: false });
                      setIsEmailVerificationDropdownOpen(false);
                    }}
                  >
                    <XCircle size={16} />
                    Unverified
                  </li>
                  <li
                    className={`dropdown-list-item ${editingUser.isEmailVerified ? 'selected' : ''}`}
                    onClick={() => {
                      setEditingUser({ ...editingUser, isEmailVerified: true });
                      setIsEmailVerificationDropdownOpen(false);
                    }}
                  >
                    <Check size={16} />
                    Verified
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-modal cancel-btn" onClick={onClose} disabled={isSubmitting}>
            <XCircle size={18} /> Cancel
          </button>
          <button className="btn-modal save-btn" onClick={handleSave} disabled={isSubmitting}>
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
