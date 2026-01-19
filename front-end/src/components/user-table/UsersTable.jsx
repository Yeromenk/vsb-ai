import React from 'react';
import {
  Edit,
  Trash2,
  Check,
  X,
  Key,
  Calendar,
  AlertCircle,
  Users,
  Mail,
  Lock,
  Settings,
} from 'lucide-react';

const UsersTable = ({ filteredUsers, handleEdit, confirmDelete, formatDate }) => {
  return (
    <div className="users-table">
      <table>
        <thead>
          <tr>
            <th>
              <Users size={16} /> Username
            </th>
            <th>
              <Mail size={16} /> Email
            </th>
            <th>
              <AlertCircle size={16} /> Status
            </th>
            <th>
              <Lock size={16} /> Auth Method
            </th>
            <th>
              <Key size={16} /> API Key
            </th>
            <th>
              <Calendar size={16} /> Created
            </th>
            <th>
              <Settings size={16} /> Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <tr key={user.id} className="user-row">
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {user.isEmailVerified ? (
                    <span className="status-badge status-verified">
                      <Check size={14} /> Verified
                    </span>
                  ) : (
                    <span className="status-badge status-unverified">
                      <X size={14} /> Unverified
                    </span>
                  )}
                </td>
                <td>
                  <span className="auth-method">{user.authMethod}</span>
                </td>
                <td>
                  <div className="api-key-container">
                    {user.apiKey ? (
                      <>
                        <Key size={16} />
                        <span className="api-key-value">API Key Set</span>
                      </>
                    ) : (
                      <span>No API Key</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <button className="button edit-btn" onClick={() => handleEdit(user)}>
                      <Edit size={18} />
                    </button>
                    <button
                      className="button delete-btn"
                      onClick={() => confirmDelete(user.id)}
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">
                <div className="no-results">
                  <div className="not-found-message">
                    <AlertCircle size={18} style={{ marginRight: '10px' }} />
                    No users found matching your search
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
