import { useState } from 'react';
import api from '../../../api/api';

export default function InventoryModal({ item, closeModal, refreshInventory }) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  // Handle updating the inventory item
  const handleUpdateItem = async () => {
    setLoading(true); // Start loading when request is sent
    try {
      const response = await api.put(`/api/inventory/${item.id}`, {
        name,
        description,
        quantity,
      });

      // Check if the update was successful
      if (response.status === 200) {
        setSuccess('Item updated successfully!');
        setError(null);
        refreshInventory(); // Refresh inventory list after update
        closeModal(); // Close the modal
      } else {
        setError('Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
      setSuccess(null);
    } finally {
      setLoading(false); // Stop loading when request completes
    }
  };

  // Handle deleting the inventory item
  const handleDeleteItem = async () => {
    setLoading(true); // Start loading when request is sent
    try {
      const response = await api.delete(`/api/inventory/${item.id}`);

      // Check if deletion was successful
      if (response.status === 200) {
        refreshInventory(); // Refresh inventory list after deletion
        closeModal(); // Close the modal
      } else {
        setError('Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    } finally {
      setLoading(false); // Stop loading when request completes
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Edit Inventory Item</h2>

        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <textarea
          className="w-full p-2 mb-4 border rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        <input
          type="number"
          className="w-full p-2 mb-4 border rounded"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={loading}
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="flex justify-between">
          <button
            onClick={handleUpdateItem}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
          <button
            onClick={handleDeleteItem}
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
