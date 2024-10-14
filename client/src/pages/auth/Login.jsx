import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import api from '../../../api/api'; // Import the configured Axios instance

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Make the login request to your backend
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login successful:', response.data.message);
      setError(null);
      // Redirect to the dashboard or another protected page
      navigate('/dashboard');
    } catch (err) {
      // Check if the error is due to rate-limiting
      if (err.response && err.response.status === 429) {
        setError('Too many login attempts. Please try again in 15 minutes.');
      } else if (err.response && err.response.data.message) {
        // Display any other backend-provided error message
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-8 shadow-md rounded-md"
        onSubmit={handleLogin}
      >
        <h2 className="text-2xl font-bold mb-6">Login</h2>
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
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
        {/* Link to register page */}
        <p className="mt-4">
          Don't have an account? <Link to="/register" className="text-blue-500">Register here</Link>.
        </p>
      </form>
    </div>
  );
}
