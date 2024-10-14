import { useState, useEffect } from 'react';
import api from '../../../api/api';
import InventoryModal from './InventoryModal'; // Import the modal component for editing

export default function InventoryTable({ refreshInventory }) {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedItem, setSelectedItem] = useState(null); // Add selected item for modal

  // Function to fetch inventory items
  const fetchInventory = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await api.get('/api/inventory');
      setInventory(response.data);
      console.log('Fetched inventory:', response.data); // Log the fetched items
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchInventory(); // Fetch inventory on component mount
  }, []);

  // Handle row click to show item details in modal
  const handleRowClick = (item) => {
    setSelectedItem(item); // Set selected item to open modal
  };

  // Close the modal and reset selectedItem
  const closeModal = () => {
    setSelectedItem(null); // Close the modal
  };

  if (loading) {
    return <p>Loading inventory...</p>; // Loading indicator
  }

  return (
    <div className="w-full max-w-6xl">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-gray-600 mb-2 text-sm">Click on an inventory row to view details.</p> {/* Directive for the table */}
      <table className="table-auto w-full bg-white shadow-md rounded-md text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-2 py-1">ID</th>
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Description</th>
            <th className="px-2 py-1">Quantity</th>
            {/* Created At and Created By */}
            <th className="px-2 py-1">Created At</th>
            <th className="px-2 py-1">Created By</th>
            {/* Updated At and Updated By */}
            <th className="px-2 py-1">Updated At</th>
            <th className="px-2 py-1">Updated By</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length > 0 ? (
            inventory.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-gray-100">
                <td className="border px-2 py-1 text-center">{item.id}</td>
                <td className="border px-2 py-1 text-center">{item.name}</td>
                <td className="border px-2 py-1 text-center">{item.description}</td>
                <td className="border px-2 py-1 text-center">{item.quantity}</td>
                {/* Created At and Created By next to each other */}
                <td className="border px-2 py-1 text-center">{new Date(item.created_at).toLocaleString()}</td>
                <td className="border px-2 py-1 text-center">{item.created_by_username || 'N/A'}</td>
                {/* Updated At and Updated By next to each other */}
                <td className="border px-2 py-1 text-center">{new Date(item.updated_at).toLocaleString()}</td>
                <td className="border px-2 py-1 text-center">{item.updated_by_username || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-4">
                No inventory items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Show inventory details in modal */}
      {selectedItem && (
        <InventoryModal
          item={selectedItem}
          closeModal={closeModal}
          refreshInventory={fetchInventory} // Pass refreshInventory to refresh the table after an update
        />
      )}
    </div>
  );
}
