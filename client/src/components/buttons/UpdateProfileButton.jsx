// src/components/UpdateProfileButton.jsx
import { useNavigate } from 'react-router-dom';

export default function UpdateProfileButton() {
  const navigate = useNavigate();

  const handleUpdateProfile = () => {
    navigate('/update-profile'); // Navigate to the update profile page
  };

  return (
    <button
      onClick={handleUpdateProfile}
      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
    >
      Update Profile
    </button>
  );
}
