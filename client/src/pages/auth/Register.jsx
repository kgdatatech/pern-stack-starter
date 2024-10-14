import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import api from '../../../api/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role set to 'user'
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
        role, // Include role in the registration payload
      });
      console.log('Registration successful:', response.data.message);
      setError(null);
      setValidationErrors([]); // Clear any validation errors
      // Redirect to the login page
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Display validation errors
        setError(err.response.data.message || 'Registration failed');
        setValidationErrors(err.response.data.errors || []);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 shadow-md rounded-md"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl font-bold mb-6">Register</h2>
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
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {validationErrors.length > 0 && (
          <ul className="text-red-500 mb-4">
            {validationErrors.map((err, index) => (
              <li key={index}>{err.msg}</li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register
        </button>
        {/* Link to login page */}
        <p className="mt-4">
          Already have an account? <Link to="/login" className="text-blue-500">Login here</Link>.
        </p>
      </form>
    </div>
  );
}
