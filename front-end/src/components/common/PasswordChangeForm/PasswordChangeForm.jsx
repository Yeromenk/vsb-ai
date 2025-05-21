import React, { useState } from 'react';
import axios from 'axios';
import { RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

const PasswordChangeForm = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(newPassword)
    ) {
      newErrors.newPassword =
        'Password must contain at least 8 characters including an uppercase letter, lowercase letter, number, and special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        'http://localhost:3000/account/change-password',
        {
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      toast.success('Password changed successfully');
      onSuccess();

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);

      if (error.response?.data?.isOAuthUser) {
        toast.error(
          'Password change is not available for accounts created through Google, GitHub or VSB'
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="password-change-form">
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RotateCw size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
