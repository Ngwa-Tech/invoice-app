import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../api/invoices';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const res = await getInvoices();
      setInvoices(res.data);
    } finally {
      setLoading(false);
    }
  }

  const outstanding = invoices
    .filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + inv.total, 0);

  const paid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueCount = invoices.filter((inv) => inv.status === 'OVERDUE').length;
  const recentInvoices = [...invoices].slice(0, 5);

  const statusStyles = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user?.name}</h2>
      <p className="text-gray-500 text-sm mb-6">Here's what's happening with your invoices.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">${outstanding.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">${paid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Overdue Invoices</p>
          <p className="text-2xl font-bold text-red-500">{overdueCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        <Link to="/invoices" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View all
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {recentInvoices.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">No invoices yet.</p>
            <Link to="/invoices/new">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Create your first invoice
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">{inv.client?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-900 font-medium">${inv.total.toFixed(2)}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[inv.status]}`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;