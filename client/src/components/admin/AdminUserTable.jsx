import { useState, useEffect } from 'react';
import api from '../../../api/api';
import UserModal from './UserModal';

export default function AdminUserTable() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user for modal

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
      console.log('Fetched users:', response.data); // Log the fetched users
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  // Handle row click to show user details in modal
  const handleRowClick = (user) => {
    setSelectedUser(user); // Set selected user to open modal
  };

  // Close the modal and reset selectedUser
  const closeModal = () => {
    setSelectedUser(null); // Close the modal
  };

  if (loading) {
    return <p>Loading users...</p>; // Loading indicator
  }

  return (
    <div className="w-full max-w-6xl">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-gray-600 mb-2 text-sm">Click on a user row to view details.</p> {/* Directive for the table */}
      <table className="table-auto w-full bg-white shadow-md rounded-md text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-2 py-1">ID</th>
            <th className="px-2 py-1">Username</th>
            <th className="px-2 py-1">Email</th>
            <th className="px-2 py-1">Role</th>
            {/* Created At and Created By moved next to each other */}
            <th className="px-2 py-1">Created At</th>
            <th className="px-2 py-1">Created By</th>
            {/* Updated At and Updated By moved next to each other */}
            <th className="px-2 py-1">Updated At</th>
            <th className="px-2 py-1">Updated By</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id} onClick={() => handleRowClick(user)} className="cursor-pointer hover:bg-gray-100">
                <td className="border px-2 py-1 text-center">{user.id}</td>
                <td className="border px-2 py-1 text-center">{user.username}</td>
                <td className="border px-2 py-1 text-center">{user.email}</td>
                <td className="border px-2 py-1 text-center">{user.role}</td>
                {/* Created At and Created By next to each other */}
                <td className="border px-2 py-1 text-center">{new Date(user.created_at).toLocaleString()}</td>
                <td className="border px-2 py-1 text-center">{user.created_by_username || 'N/A'}</td>
                {/* Updated At and Updated By next to each other */}
                <td className="border px-2 py-1 text-center">{new Date(user.updated_at).toLocaleString()}</td>
                <td className="border px-2 py-1 text-center">{user.updated_by_username || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Show user details in modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          closeModal={closeModal}
          refreshUsers={fetchUsers} // Pass refreshUsers to refresh the table after an update
        />
      )}
    </div>
  );
}
