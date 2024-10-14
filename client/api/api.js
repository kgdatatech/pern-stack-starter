import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'https://localhost:5000', // Update the base URL if needed
  withCredentials: true, // Ensure cookies (JWT and CSRF tokens) are sent with requests
});

// Add a request interceptor to inject the CSRF token into every request's headers
api.interceptors.request.use((config) => {
  // Get the CSRF token from the cookies
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]; // Extract the token value

  if (csrfToken) {
    // Add the CSRF token to the headers of the request
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
}, (error) => {
  // Handle request error
  return Promise.reject(error);
});

export default api;
