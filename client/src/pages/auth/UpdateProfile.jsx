import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';

export default function UpdateProfile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // Add role state
  const [password, setPassword] = useState(''); // Add password state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/api/users/me'); // Fetch the current user's data
        console.log('User data:', response.data); // Log the response for debugging
        setUsername(response.data.username);
        setEmail(response.data.email);
        setRole(response.data.role); // Set role if returned by the API
      } catch (err) {
        console.error('Error fetching user details:', err.response?.data || err); // Log error
        navigate('/login'); // Redirect to login if not authenticated
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = { username, email };
      if (role) updateData.role = role; // Include role only if it's not empty
      if (password) updateData.password = password; // Include password only if it's not empty

      const response = await api.put('/api/users/update', updateData); // Adjust the endpoint
      setSuccess('Profile updated successfully!');
      setError(null);

      // Auto-refresh after 2 seconds back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to update profile');
      setSuccess(null);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 shadow-md rounded-md w-full max-w-md"
        onSubmit={handleUpdate}
      >
        <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-4 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Role selection (admin only, or if allowed) */}
        <select
          className="w-full p-2 mb-4 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
        {/* Password update */}
        <input
          type="password"
          placeholder="New Password (optional)"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success} Redirecting...</p>}
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Update
        </button>

        <button
          onClick={handleBackToDashboard}
          className="w-full mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </form>
    </div>
  );
}
