import React, { useEffect, useState } from 'react';
import './ProfileModal.css';
import axios from 'axios';
import { User, X, Key } from 'lucide-react';
import PasswordChangeForm from '../../components/common/PasswordChangeForm/PasswordChangeForm';
import UserInfo from '../../components/common/UserInfo/UserInfo';
import DangerZone from '../../components/common/DangerZone/DangerZone';
import ModelSettings from '../../components/common/ModelSettings/ModelSetting';
import LoadingState from '../../components/common/LoadingState/LoadingState';

const ProfileModal = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/auth/profile', {
        withCredentials: true,
      });

      setProfileData({
        ...response.data,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setLoading(false);
    }
  };

  const canChangePassword = () => {
    return profileData && !profileData.googleId && !profileData.githubId && !profileData.vsbId;
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            <User size={28} />
          </div>
          <h2>My Profile</h2>
        </div>

        {loading ? (
          <div className="loading">
            <LoadingState message={'Loading profile data...'} />
          </div>
        ) : (
          <>
            <UserInfo profileData={profileData} formatDate={formatDate} />

            <ModelSettings />

            {canChangePassword() && (
              <div className="profile-actions">
                <button
                  className="change-password-button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  <Key size={16} />
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>
            )}

            {isChangingPassword && (
              <PasswordChangeForm
                onSuccess={() => {
                  setIsChangingPassword(false);
                }}
              />
            )}

            <div className="section-divider"></div>

            <DangerZone onAccountDeleted={onClose} profileData={profileData} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
