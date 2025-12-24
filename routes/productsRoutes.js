const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/products - Get all products for authenticated user
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id - Get single product by ID (verify ownership)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, barcode, category, imageUrl } = req.body;
    
    // Check for barcode uniqueness per user
    if (barcode) {
      const existingProduct = await Product.findOne({ 
        barcode, 
        userId: req.user.userId 
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'Barcode already exists for this user' });
      }
    }
    
    const product = new Product({
      name,
      description,
      price,
      barcode,
      category,
      imageUrl,
      userId: req.user.userId
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id - Update product (verify ownership)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, barcode, category, imageUrl } = req.body;
    
    // Check if product exists and belongs to user
    const existingProduct = await Product.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check for barcode uniqueness per user (excluding current product)
    if (barcode && barcode !== existingProduct.barcode) {
      const barcodeExists = await Product.findOne({ 
        barcode, 
        userId: req.user.userId,
        _id: { $ne: req.params.id }
      });
      if (barcodeExists) {
        return res.status(400).json({ message: 'Barcode already exists for this user' });
      }
    }
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name, description, price, barcode, category, imageUrl },
      { new: true, runValidators: true }
    );
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id - Delete product (verify ownership)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/search/:query - Search products for authenticated user
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const products = await Product.find({ 
      userId: req.user.userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;