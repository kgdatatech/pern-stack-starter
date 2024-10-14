import { useState } from 'react';
import api from '../../../api/api';

export default function UserModal({ user, closeModal, refreshUsers }) {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  const handleUpdateUser = async () => {
    setLoading(true); // Start loading when request is sent
    try {
      const response = await api.put(`/api/admin/users/${user.id}`, {
        username,
        email,
        role,
      });

      // Check if the update was successful
      if (response.status === 200) {
        setSuccess('User updated successfully!');
        setError(null);
        refreshUsers(); // Refresh user list after update
        closeModal(); // Close the modal
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
      setSuccess(null);
    } finally {
      setLoading(false); // Stop loading when request completes
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true); // Start loading when request is sent
    try {
      const response = await api.delete(`/api/admin/users/${user.id}`);

      // Check if deletion was successful
      if (response.status === 200) {
        refreshUsers(); // Refresh user list after deletion
        closeModal(); // Close the modal
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setLoading(false); // Stop loading when request completes
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Edit User</h2>

        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <input
          type="email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <select
          className="w-full p-2 mb-4 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="flex justify-between">
          <button
            onClick={handleUpdateUser}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
          <button
            onClick={handleDeleteUser}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
