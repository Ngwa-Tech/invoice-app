const express = require('express');
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// CREATE
router.post('/', async (req, res) => {
  try {
    const { name, email, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Client name and email are required.' });
    }

    const client = await prisma.client.create({
      data: { name, email, address, userId: req.userId },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Something went wrong creating the client.' });
  }
});

// LIST (only this user's clients)
router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('List clients error:', error);
    res.status(500).json({ error: 'Something went wrong fetching clients.' });
  }
});

// GET ONE
router.get('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Something went wrong fetching the client.' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { name, email, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Client name and email are required.' });
    }

    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: { name, email, address },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Something went wrong updating the client.' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    await prisma.client.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Something went wrong deleting the client.' });
  }
});

module.exports = router;