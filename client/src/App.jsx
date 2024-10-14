import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/auth/Dashboard';
import UpdateProfile from './pages/auth/UpdateProfile';
import Inventory from './pages/inventory/Inventory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
