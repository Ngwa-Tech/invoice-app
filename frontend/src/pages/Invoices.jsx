import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, updateInvoiceStatus, deleteInvoice } from '../api/invoices';
import api from '../api/axios';

const statusStyles = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const res = await getInvoices();
      setInvoices(res.data);
    } catch (err) {
      setError('Failed to load invoices.');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await updateInvoiceStatus(id, status);
      loadInvoices();
    } catch (err) {
      setError('Failed to update status.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      loadInvoices();
    } catch (err) {
      setError('Failed to delete invoice.');
    }
  }

  async function handleDownloadPdf(id, invoiceNumber) {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download PDF.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
        <Link to="/invoices/new">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + New Invoice
          </button>
        </Link>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No invoices yet — create your first one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">${inv.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusStyles[inv.status]}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)} className="text-indigo-600 hover:text-indigo-800 font-medium">
                        PDF
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700 font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Invoices;