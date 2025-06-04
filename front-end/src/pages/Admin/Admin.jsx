import { useState, useEffect } from 'react';
import './Admin.css';
import { Shield, Search, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import DeleteModal from '../../components/common/DeleteModal/DeleteModal';
import UsersTable from '../../components/common/UsersTable/UsersTable';
import EditUserModal from '../../components/common/EditUserModal/EditUserModal';

const API_URL = 'http://localhost:3000';
const USERS_PER_PAGE = 10;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handleSearchChange = e => {
    // Show loading indicator when searching
    setSearchLoading(true);

    // Debounce search to simulate API search latency
    const value = e.target.value;
    setTimeout(() => {
      setSearchTerm(value);
      setSearchLoading(false);
    }, 300);
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
      setIsSubmitting(true);
      await deleteUser(userToDelete);
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    } finally {
      setIsSubmitting(false);
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

    setEditingUser({
      ...user,
      fullApiKey,
    });
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
        users.map(user => (user.id === updatedUserData.id ? { ...user, ...userData } : user))
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = pageNumber => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination components
  const renderPaginationItems = () => {
    const items = [];
    const maxButtons = 5; // Maximum number of page buttons to show

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Previous button
    items.push(
      <button
        key="prev"
        className="pagination-button"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => goToPage(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    items.push(
      <button
        key="next"
        className="pagination-button"
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    );

    return items;
  };

  return (
    <div className="admin-container">
      <div className="admin">
        <h1>
          <Shield size={24} /> Admin Dashboard
        </h1>

        <div className="search-container-admin">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email"
            onChange={handleSearchChange}
          />
          {searchLoading && <Loader size={16} className="search-loading" />}
        </div>

        {loading ? (
          <LoadingState message="Loading users..." />
        ) : (
          <>
            {searchLoading ? (
              <LoadingState message="Searching users..." />
            ) : (
              <>
                <UsersTable
                  filteredUsers={currentUsers}
                  handleEdit={handleEdit}
                  confirmDelete={confirmDelete}
                  formatDate={formatDate}
                />

                {filteredUsers.length > 0 && (
                  <div className="pagination">{renderPaginationItems()}</div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      )}

      {deleteModalOpen && (
        <DeleteModal
          isOpen={deleteModalOpen}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          isSubmitting={isSubmitting}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
