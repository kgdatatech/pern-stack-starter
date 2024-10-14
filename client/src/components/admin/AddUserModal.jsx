import { useState } from 'react';
import api from '../../../api/api';

export default function AddUserModal({ closeModal, refreshUsers }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to 'user' role
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      await api.post('/api/admin/users', {
        username,
        email,
        password,
        role,
      });
      setSuccess('User created successfully!');
      setError(null);
      refreshUsers(); // Refresh the user list
      closeModal(); // Close the modal after success
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        // Display validation errors from the backend
        const errorMessages = err.response.data.errors.map((error) => error.msg).join(', ');
        setError(`Failed to create user: ${errorMessages}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        // Display specific error message from backend (e.g., duplicate email)
        setError(`Failed to create user: ${err.response.data.message}`);
      } else {
        // Generic error message
        setError('Failed to create user');
      }
      setSuccess(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Add New User</h2>
        <form onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-4 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="w-full p-2 mb-4 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add User
            </button>
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
