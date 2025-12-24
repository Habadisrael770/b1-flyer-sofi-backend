const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock data for products
const mockProducts = [
  { id: 1, name: 'מוצר לדוגמה 1', price: 29.99, image: '/uploads/sample1.jpg' },
  { id: 2, name: 'מוצר לדוגמה 2', price: 49.99, image: '/uploads/sample2.jpg' },
  { id: 3, name: 'מוצר לדוגמה 3', price: 19.99, image: '/uploads/sample3.jpg' }
];

// Mock data for flyers
const mockFlyers = [
  { id: 1, name: 'פלייר לדוגמה', template: 'basic', createdAt: new Date().toISOString() }
];

// API Routes
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: mockProducts });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({ success: false, message: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  const newProduct = { id: mockProducts.length + 1, ...req.body };
  mockProducts.push(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.get('/api/flyers', (req, res) => {
  res.json({ success: true, data: mockFlyers });
});

app.post('/api/flyers', (req, res) => {
  const newFlyer = { id: mockFlyers.length + 1, ...req.body, createdAt: new Date().toISOString() };
  mockFlyers.push(newFlyer);
  res.status(201).json({ success: true, data: newFlyer });
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({ 
      success: true, 
      token: 'mock-jwt-token-' + Date.now(),
      user: { id: 1, email, name: 'Test User' }
    });
  } else {
    res.status(400).json({ success: false, message: 'Email and password required' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (email && password) {
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: Date.now(), email, name }
    });
  } else {
    res.status(400).json({ success: false, message: 'Email and password required' });
  }
});

// Business routes (mock)
app.get('/api/business', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      id: 1, 
      name: 'העסק שלי', 
      logo: '/uploads/logo.png',
      address: 'תל אביב, ישראל'
    }
  });
});

// Static files
app.use('/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'B1-Flyer Backend API',
    version: '1.0.0',
    endpoints: ['/health', '/api/products', '/api/flyers', '/api/auth/login', '/api/business']
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 B1-Flyer Backend Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
