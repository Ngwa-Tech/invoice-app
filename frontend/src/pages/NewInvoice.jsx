import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../api/clients';
import { createInvoice } from '../api/invoices';

function NewInvoice() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const res = await getClients();
      setClients(res.data);
      if (res.data.length > 0) setClientId(res.data[0].id);
    } catch (err) {
      setError('Failed to load clients.');
    }
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = field === 'description' ? value : Number(value);
    setItems(updated);
  }

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!clientId || !dueDate) {
      setError('Please select a client and due date.');
      return;
    }

    try {
      await createInvoice({ clientId, dueDate, taxRate: Number(taxRate), items });
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice.');
    }
  }

  const inputClass =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Invoice</h2>

      {clients.length === 0 && (
        <p className="bg-orange-50 text-orange-700 text-sm p-3 rounded-lg mb-4">
          You need at least one client before creating an invoice — add one on the Clients page first.
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={`${inputClass} w-full`}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={`${inputClass} w-full`} />
          </div>
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
          <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} min="0" className={`${inputClass} w-full`} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  required
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  min="1"
                  className={`${inputClass} w-20`}
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  className={`${inputClass} w-28`}
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-sm px-2">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            + Add Item
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-900 font-semibold text-base pt-1">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={clients.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          Create Invoice
        </button>
      </form>
    </div>
  );
}

export default NewInvoice;