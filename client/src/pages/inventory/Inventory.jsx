// src/pages/Inventory.jsx
import { useState, useEffect } from 'react';
import api from '../../../api/api';  // Axios instance
import InventoryTable from '../../components/inventory/InventoryTable';
import AddItemModal from '../../components/inventory/AddItemModal';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/api/inventory');
        setInventory(response.data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory.');
      }
    };
    
    fetchInventory();
  }, []);

  const toggleAddItemModal = () => {
    setShowAddItemModal(!showAddItemModal);
  };

  const refreshInventory = async () => {
    try {
      const response = await api.get('/api/inventory');
      setInventory(response.data);
    } catch (err) {
      console.error('Error refreshing inventory:', err);
      setError('Failed to refresh inventory.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl mb-6">Inventory Management</h2>
      {error && <p className="text-red-500">{error}</p>}
      
      <button 
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded hover:bg-blue-600"
        onClick={toggleAddItemModal}
      >
        Add New Item
      </button>
      
      <InventoryTable inventory={inventory} refreshInventory={refreshInventory} />
      
      {showAddItemModal && (
        <AddItemModal closeModal={toggleAddItemModal} refreshInventory={refreshInventory} />
      )}
    </div>
  );
}
