import api from './axios';

export const getInvoices = () => api.get('/invoices');
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoiceStatus = (id, status) => api.put(`/invoices/${id}/status`, { status });
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const getInvoicePdfUrl = (id) => `http://localhost:5000/api/invoices/${id}/pdf`;