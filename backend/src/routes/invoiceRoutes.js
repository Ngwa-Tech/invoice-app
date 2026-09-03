const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');

const router = express.Router();

router.use(authMiddleware);

function calculateTotal(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

// CREATE
router.post('/', async (req, res) => {
  try {
    const { clientId, dueDate, taxRate = 0, items } = req.body;

    if (!clientId || !dueDate || !items || items.length === 0) {
      return res.status(400).json({ error: 'clientId, dueDate, and at least one item are required.' });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: req.userId },
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const invoiceCount = await prisma.invoice.count({ where: { userId: req.userId } });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: new Date(dueDate),
        taxRate,
        userId: req.userId,
        clientId,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true, client: true },
    });

    res.status(201).json({ ...invoice, ...calculateTotal(invoice.items, invoice.taxRate) });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Something went wrong creating the invoice.' });
  }
});

// LIST
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      include: { items: true, client: true },
      orderBy: { createdAt: 'desc' },
    });

    const withTotals = invoices.map((inv) => ({
      ...inv,
      ...calculateTotal(inv.items, inv.taxRate),
    }));

    res.json(withTotals);
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({ error: 'Something went wrong fetching invoices.' });
  }
});

// GET ONE
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: true, client: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    res.json({ ...invoice, ...calculateTotal(invoice.items, invoice.taxRate) });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Something went wrong fetching the invoice.' });
  }
});

// UPDATE STATUS (draft/sent/paid/overdue)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ error: 'Something went wrong updating the invoice.' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: req.params.id } });
    await prisma.invoice.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Something went wrong deleting the invoice.' });
  }
});


router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: true, client: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const { subtotal, tax, total } = calculateTotal(invoice.items, invoice.taxRate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(invoice.invoiceNumber, { align: 'right' });
    doc.moveDown();

    doc.fontSize(12).text(`Bill to: ${invoice.client.name}`);
    doc.text(invoice.client.email);
    if (invoice.client.address) doc.text(invoice.client.address);
    doc.moveDown();

    doc.text(`Issue date: ${invoice.issueDate.toDateString()}`);
    doc.text(`Due date: ${invoice.dueDate.toDateString()}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    doc.fontSize(11).text('Description', 50, doc.y, { continued: true });
    doc.text('Qty', 300, doc.y, { continued: true });
    doc.text('Unit Price', 370, doc.y, { continued: true });
    doc.text('Amount', 470, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    invoice.items.forEach((item) => {
      const amount = item.quantity * item.unitPrice;
      const y = doc.y;
      doc.text(item.description, 50, y, { continued: true });
      doc.text(String(item.quantity), 300, y, { continued: true });
      doc.text(`$${item.unitPrice.toFixed(2)}`, 370, y, { continued: true });
      doc.text(`$${amount.toFixed(2)}`, 470, y);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax (${invoice.taxRate}%): $${tax.toFixed(2)}`, { align: 'right' });
    doc.fontSize(13).text(`Total: $${total.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Something went wrong generating the PDF.' });
  }
});

module.exports = router;