import React from 'react';
import { Mail, Clock, User } from 'lucide-react';

const UserInfo = ({ profileData, formatDate }) => {
  return (
    <div className="profile-info">
      <div className="info-item">
        <div className="info-icon">
          <User size={18} />
        </div>
        <div className="info-content">
          <div className="label">Username</div>
          <div className="value">{profileData?.username}</div>
        </div>
      </div>

      <div className="info-item">
        <div className="info-icon">
          <Mail size={18} />
        </div>
        <div className="info-content">
          <div className="label">Email</div>
          <div className="value">{profileData?.email}</div>
        </div>
      </div>

      <div className="info-item">
        <div className="info-icon">
          <Clock size={18} />
        </div>
        <div className="info-content">
          <div className="label">Joined</div>
          <div className="value">{formatDate(profileData?.createdAt)}</div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
