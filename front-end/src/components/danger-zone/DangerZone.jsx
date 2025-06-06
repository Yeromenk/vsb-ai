import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CircleUser, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DangerZone = ({ onAccountDeleted }) => {
  const [isConfirmingDeleteChats, setIsConfirmingDeleteChats] = useState(false);
  const [isConfirmingDeleteAccount, setIsConfirmingDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [hasChats, setHasChats] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const checkUserChats = async () => {
      try {
        setLoadingChats(true);
        const response = await axios.get('http://localhost:3000/ai/userChats', {
          withCredentials: true,
        });

        // Check if user has any chats
        const chats = response.data.response || [];
        setHasChats(chats.length > 0);
      } catch (error) {
        console.error('error checking user chats:', error);
        toast.error('Failed to check for existing chats');
      } finally {
        setLoadingChats(false);
      }
    };

    checkUserChats();
  }, []);

  const isDeleteChatsConfirmValid = () => {
    return deleteConfirmText.toLowerCase() === 'delete';
  };

  const isDeleteAccountConfirmValid = () => {
    return deleteConfirmText.toUpperCase() === 'DELETE ACCOUNT';
  };

  const handleDeleteAllChats = async () => {
    if (!isDeleteChatsConfirmValid()) return;

    try {
      setIsDeleting(true);
      await axios.delete('http://localhost:3000/ai/delete-all-chats', {
        withCredentials: true,
      });

      toast.success('All chats have been deleted');
      setIsConfirmingDeleteChats(false);
      setDeleteConfirmText('');
      setHasChats(false);
    } catch (error) {
      console.error('error deleting chats:', error);
      toast.error('Failed to delete chats');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isDeleteAccountConfirmValid()) return;

    try {
      setIsDeleting(true);
      await axios.delete('http://localhost:3000/auth/delete-account', {
        withCredentials: true,
      });

      toast.success('Your account has been deleted');
      await logout();
      onAccountDeleted();
      navigate('/login');
    } catch (error) {
      console.error('error deleting account:', error);
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="danger-zone">
      <div className="danger-actions">
        {loadingChats ? (
          <div className="loading-chats">
            <RotateCw size={16} className="animate-spin" />
            <span>Checking for chats...</span>
          </div>
        ) : (
          <>
            {hasChats && !isConfirmingDeleteAccount && (
              <div>
                {isConfirmingDeleteChats ? (
                  <div className="confirm-delete">
                    <div className="confirm-alert">
                      <p>
                        This action will permanently delete <strong>ALL</strong> of your chats. This
                        cannot be undone.
                      </p>
                    </div>
                    <div className="confirm-input-container">
                      <label>Type "delete" to confirm:</label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder="delete"
                      />
                    </div>
                    <div className="confirm-actions">
                      <button
                        className="confirm-button"
                        onClick={handleDeleteAllChats}
                        disabled={!isDeleteChatsConfirmValid() || isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <RotateCw size={16} className="animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete All Chats'
                        )}
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => {
                          setIsConfirmingDeleteChats(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="delete-chats-button"
                    onClick={() => setIsConfirmingDeleteChats(true)}
                  >
                    <MessageSquare size={16} />
                    Delete All Chats
                  </button>
                )}
              </div>
            )}

            {!isConfirmingDeleteChats && (
              <div>
                {isConfirmingDeleteAccount ? (
                  <div className="confirm-delete">
                    <div className="confirm-alert">
                      <p>
                        This action will permanently delete your account and all associated data.
                        This cannot be undone.
                      </p>
                    </div>
                    <div className="confirm-input-container">
                      <label>Type "DELETE ACCOUNT" in all caps to confirm:</label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE ACCOUNT"
                      />
                    </div>
                    <div className="confirm-actions">
                      <button
                        className="confirm-button"
                        onClick={handleDeleteAccount}
                        disabled={!isDeleteAccountConfirmValid() || isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <RotateCw size={16} className="animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Account'
                        )}
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => {
                          setIsConfirmingDeleteAccount(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="delete-account-button"
                    onClick={() => setIsConfirmingDeleteAccount(true)}
                  >
                    <CircleUser size={16} />
                    Delete Account
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DangerZone;
