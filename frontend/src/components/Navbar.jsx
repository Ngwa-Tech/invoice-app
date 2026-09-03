import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
      <Link to="/dashboard" className="text-xl font-bold text-indigo-600">InvoiceApp</Link>
      <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition">Dashboard</Link>
      <Link to="/clients" className="text-gray-600 hover:text-indigo-600 transition">Clients</Link>
      <Link to="/invoices" className="text-gray-600 hover:text-indigo-600 transition">Invoices</Link>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-gray-500 text-sm">{user.name}</span>
        <button
          onClick={handleLogout}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;