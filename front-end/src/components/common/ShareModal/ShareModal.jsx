import React, { useState, useEffect } from 'react';
import { X, Copy, Link2 } from 'lucide-react';
import './ShareModal.css';
import axios from 'axios';

const ShareModal = ({ isOpen, onClose, chatId }) => {
  const [permission, setPermission] = useState('view');
  const [shareLink, setShareLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && chatId) {
      // Fetch existing share link
      (async () => {
        try {
          const res = await axios.get(`http://localhost:3000/ai/chat/${chatId}/share`, {
            withCredentials: true,
          });
          if (res.data.shareLink) {
            setShareLink(res.data.shareLink);
            setPermission(res.data.permission || 'view');
          } else {
            setShareLink('');
            setPermission('view');
          }
        } catch {
          setShareLink('');
          setPermission('view');
        }
      })();
    }
  }, [isOpen, chatId]);

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

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/ai/chat/${chatId}/share`,
        { permission },
        { withCredentials: true }
      );

      const data = response.data;
      if (data.success) {
        setShareLink(data.shareLink);
      }
    } catch (error) {
      console.error('Error sharing chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async () => {
    setIsUpdatingPermission(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/ai/chat/${chatId}/share`,
        { permission },
        { withCredentials: true }
      );

      const data = response.data;
      if (data.success) {
        setShareLink(data.shareLink);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
    } finally {
      setIsUpdatingPermission(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = e => {
    if (e.target.classList.contains('share-modal-overlay')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={handleOverlayClick}>
      <div className="share-modal">
        <div className="share-modal-header">
          <h3>
            <Link2 size={20} className="modal-link-icon" />
            Share Chat
          </h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="share-modal-content">
          <div className="permission-selector">
            <p>Who can access this chat?</p>
            <div className="permission-options">
              <label className="permission-option">
                <input
                  type="radio"
                  name="permission"
                  value="view"
                  checked={permission === 'view'}
                  onChange={() => setPermission('view')}
                />
                <div className="option-content">
                  <span className="option-title">View only</span>
                  <span className="option-description subtle">Only viewing is allowed</span>
                </div>
              </label>

              <label className="permission-option">
                <input
                  type="radio"
                  name="permission"
                  value="edit"
                  checked={permission === 'edit'}
                  onChange={() => setPermission('edit')}
                />
                <div className="option-content">
                  <span className="option-title">Can edit</span>
                  <span className="option-description subtle">
                    Viewing and writing messages allowed
                  </span>
                </div>
              </label>
            </div>
          </div>

          {!shareLink ? (
            <button className="share-button" onClick={handleShare} disabled={isLoading}>
              {isLoading ? 'Creating link...' : 'Create share link'}
            </button>
          ) : (
            <>
              {/* Show update permission button when a link already exists */}
              <button
                className="share-button update-permission"
                onClick={handleUpdatePermission}
                disabled={isUpdatingPermission}
              >
                {isUpdatingPermission ? 'Updating...' : 'Update permission'}
              </button>

              <div className="share-link-container">
                <p>Share this link with others:</p>
                <div className="link-copy-container">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="share-link-input"
                    onClick={e => e.target.select()}
                  />
                  <button
                    className={`copy-button-link ${copied ? 'copied' : ''}`}
                    onClick={copyToClipboard}
                  >
                    <Copy size={16} />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="permission-note">
                  <span>
                    People with this link can{' '}
                    {permission === 'view' ? 'only view' : 'view and edit'} this chat
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
