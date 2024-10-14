// src/components/inventory/AddItemModal.jsx
import { useState, useEffect } from 'react';
import api from '../../../api/api';

export default function AddItemModal({ closeModal, refreshInventory }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [userId, setUserId] = useState(null); // To store the current user's ID
  const [error, setError] = useState(null);

  // Fetch the current logged-in user's ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/api/users/me');
        setUserId(response.data.id); // Store the logged-in user's ID
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details');
      }
    };
    
    fetchUserDetails();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      // Ensure we include the userId, which is both the user adding the item and the creator
      await api.post('/api/inventory', {
        name,
        description,
        quantity,
        user_id: userId,        // Assign the user who "owns" this item
        created_by: userId,     // Admin creating the record
        updated_by: userId      // Admin updating the record (initially same as created_by)
      });

      refreshInventory();  // Refresh the inventory list after adding a new item
      closeModal();  // Close the modal
    } catch (err) {
      setError('Failed to add item');
      console.error('Error adding item:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
        <form onSubmit={handleAddItem}>
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 mb-4 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full p-2 mb-4 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Quantity"
            className="w-full p-2 mb-4 border rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Item
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
