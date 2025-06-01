import { useState, useEffect } from 'react';
import './Admin.css';
import { Shield, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import DeleteModal from '../../components/common/DeleteModal/DeleteModal';
import UsersTable from '../../components/common/UsersTable/UsersTable';
import EditUserModal from '../../components/common/EditUserModal/EditUserModal';

const API_URL = 'http://localhost:3000';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserApiKey = async userId => {
    try {
      const res = await axios.get(`${API_URL}/admin/users/${userId}/apikey`, {
        withCredentials: true,
      });
      return res.data.apiKey;
    } catch (error) {
      throw new Error('Failed to get API key');
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}`, userData, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  };

  const deleteUser = async userId => {
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        withCredentials: true,
      });
      return true;
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  };

  const confirmDelete = userId => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userToDelete);
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  const handleEdit = async user => {
    let fullApiKey = '';

    if (user.apiKey) {
      try {
        fullApiKey = await getUserApiKey(user.id);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    }

    setEditingUser({ ...user, fullApiKey });
  };

  const handleSave = async updatedUserData => {
    setIsSubmitting(true);
    try {
      const userData = {
        ...updatedUserData,
        apiKey: updatedUserData.apiKey || null,
      };

      await updateUser(updatedUserData.id, userData);

      setUsers(
        users.map(user =>
          user.id === updatedUserData.id
            ? {
                ...user,
                ...userData,
                apiKey: !!userData.apiKey,
              }
            : user
        )
      );

      toast.success('User updated successfully');
      setEditingUser(null);
    } catch (err) {
      toast.error('Failed to update user');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="admin-container">
      <div className="admin">
        <h1>
          <Shield size={24} /> Admin Panel
        </h1>

        <div className="search-container-admin">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <LoadingState message="Loading users..." />
        ) : (
          <UsersTable
            filteredUsers={filteredUsers}
            handleEdit={handleEdit}
            confirmDelete={confirmDelete}
            formatDate={formatDate}
          />
        )}

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />
        )}

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete User"
          message="Are you sure you want to delete this user?"
        />
      </div>
    </div>
  );
};

export default Admin;
