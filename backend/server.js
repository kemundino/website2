const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mock data
let orders = [
  {
    id: 'ORD001',
    customerName: 'John Doe',
    items: [
      { name: 'Margherita Pizza', quantity: 2, price: 14.99 },
      { name: 'Mango Smoothie', quantity: 1, price: 6.99 }
    ],
    total: 36.97,
    status: 'preparing',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ORD002', 
    customerName: 'Jane Smith',
    items: [
      { name: 'Classic Smash Burger', quantity: 1, price: 12.99 }
    ],
    total: 12.99,
    status: 'ready',
    createdAt: new Date().toISOString()
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.post('/api/hello', (req, res) => {
  res.json({ 
    message: 'Data received successfully',
    data: req.body 
  });
});

// Users API
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

app.get('/api/users', (req, res) => {
  res.json({ users });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  
  res.status(201).json({ 
    message: 'User created successfully',
    user: newUser 
  });
});

// Orders API
app.get('/api/orders', (req, res) => {
  res.json({ orders });
});

app.post('/api/orders', (req, res) => {
  const { customerName, items } = req.body;
  if (!customerName || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Customer name and items are required' });
  }
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const newOrder = {
    id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
    customerName,
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  res.status(201).json({ 
    message: 'Order created successfully',
    order: newOrder 
  });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const orderIndex = orders.findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  res.json({ 
    message: 'Order updated successfully',
    order: orders[orderIndex] 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
