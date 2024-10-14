import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import AdminUserTable from '../../components/admin/AdminUserTable';
import AddUserModal from '../../components/admin/AddUserModal';

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Control visibility of the AddUser modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetch user details (username, role)
        const userResponse = await api.get('/api/users/me');
        setRole(userResponse.data.role); // Set role to determine if the user is an admin
        setUsername(userResponse.data.username); // Set username for displaying in the welcome message
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load user details');
        navigate('/login');
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const toggleAddUserModal = () => {
    setShowAddUserModal(!showAddUserModal); // Toggle the visibility of the AddUser modal
  };

  const handleProfileUpdate = () => {
    navigate('/update-profile'); // Navigate to update profile page when clicked
  };

  const buttonStyle = "bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"; // Consistent button style

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl mb-6">
        Welcome to your dashboard, user {username ? `${username}` : 'loading...'}!
      </h2>

      {/* Button Row */}
      <div className="flex space-x-4 mb-6">
        {/* Navigate to update profile on click */}
        <button onClick={handleProfileUpdate} className={buttonStyle}>
          Update Profile
        </button>
        
        {/* Logout button for all users */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
        >
          Logout
        </button>

        {/* Admin-specific controls */}
        {role === 'admin' && (
          <button
            onClick={toggleAddUserModal}
            className={buttonStyle}
          >
            Add New User
          </button>
        )}
      </div>

      {/* Admin Table for Admin Users */}
      {role === 'admin' && (
        <>
          <h3 className="text-2xl font-bold mb-4">Admin Controls</h3>
          <AdminUserTable />
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* AddUser Modal */}
      {showAddUserModal && (
        <AddUserModal closeModal={toggleAddUserModal} refreshUsers={() => window.location.reload()} />
      )}
    </div>
  );
}
