import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient } from '../api/clients';

function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      setError('Failed to load clients.');
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await createClient({ name, email, address });
      setName('');
      setEmail('');
      setAddress('');
      loadClients();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create client.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this client?')) return;
    try {
      await deleteClient(id);
      loadClients();
    } catch (err) {
      setError('Failed to delete client.');
    }
  }

  function startEdit(client) {
    setEditingId(client.id);
    setEditName(client.name);
    setEditEmail(client.email);
    setEditAddress(client.address || '');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate(id) {
    setError('');
    try {
      await updateClient(id, { name: editName, email: editEmail, address: editAddress });
      setEditingId(null);
      loadClients();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update client.');
    }
  }

  const inputClass =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Clients</h2>

      <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-3">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        <input placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          Add Client
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {clients.length === 0 && (
          <p className="p-5 text-gray-400 text-sm">No clients yet — add one above.</p>
        )}
        {clients.map((client) =>
          editingId === client.id ? (
            <div key={client.id} className="p-4 flex flex-wrap gap-3 items-center">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputClass} />
              <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className={inputClass} />
              <button onClick={() => handleUpdate(client.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
                Save
              </button>
              <button onClick={cancelEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                Cancel
              </button>
            </div>
          ) : (
            <div key={client.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-sm text-gray-500">
                  {client.email}{client.address && ` · ${client.address}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(client)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Edit
                </button>
                <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Clients;