const express = require('express');
const Flyer = require('../models/Flyer');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/flyers - Get all flyers for authenticated user
router.get('/', async (req, res) => {
  try {
    const flyers = await Flyer.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(flyers);
  } catch (error) {
    console.error('Error fetching flyers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/flyers/:id - Get single flyer by ID (verify ownership)
router.get('/:id', async (req, res) => {
  try {
    const flyer = await Flyer.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!flyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }
    
    res.json(flyer);
  } catch (error) {
    console.error('Error fetching flyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/flyers - Create new flyer
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      template, 
      products: productIds, 
      layout,
      colors,
      fonts 
    } = req.body;

    // Fetch user's products and create snapshots
    const userProducts = await Product.find({ 
      _id: { $in: productIds }, 
      userId: req.user.userId 
    });

    // Create product snapshots (store current state)
    const productSnapshots = userProducts.map(product => ({
      productId: product._id,
      name: product.name,
      price: product.price,
      barcode: product.barcode,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl
    }));
    
    const flyer = new Flyer({
      title,
      description,
      template,
      products: productSnapshots, // Store snapshots, not references
      layout,
      colors,
      fonts,
      userId: req.user.userId
    });
    
    await flyer.save();
    res.status(201).json(flyer);
  } catch (error) {
    console.error('Error creating flyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/flyers/:id - Update flyer (verify ownership)
router.put('/:id', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      template, 
      products: productIds, 
      layout,
      colors,
      fonts 
    } = req.body;

    // Check if flyer exists and belongs to user
    const existingFlyer = await Flyer.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!existingFlyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }

    // If products are being updated, fetch fresh snapshots
    let productSnapshots = existingFlyer.products;
    if (productIds) {
      const userProducts = await Product.find({ 
        _id: { $in: productIds }, 
        userId: req.user.userId 
      });

      productSnapshots = userProducts.map(product => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        barcode: product.barcode,
        description: product.description,
        category: product.category,
        imageUrl: product.imageUrl
      }));
    }
    
    const flyer = await Flyer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { 
        title, 
        description, 
        template, 
        products: productSnapshots, 
        layout,
        colors,
        fonts 
      },
      { new: true, runValidators: true }
    );
    
    res.json(flyer);
  } catch (error) {
    console.error('Error updating flyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/flyers/:id - Delete flyer (verify ownership)
router.delete('/:id', async (req, res) => {
  try {
    const flyer = await Flyer.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!flyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }
    
    res.json({ message: 'Flyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting flyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/flyers/:id/duplicate - Duplicate flyer (verify ownership)
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalFlyer = await Flyer.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!originalFlyer) {
      return res.status(404).json({ message: 'Flyer not found' });
    }
    
    const duplicatedFlyer = new Flyer({
      title: `${originalFlyer.title} - Copy`,
      description: originalFlyer.description,
      template: originalFlyer.template,
      products: originalFlyer.products, // Keep same snapshots
      layout: originalFlyer.layout,
      colors: originalFlyer.colors,
      fonts: originalFlyer.fonts,
      userId: req.user.userId
    });
    
    await duplicatedFlyer.save();
    res.status(201).json(duplicatedFlyer);
  } catch (error) {
    console.error('Error duplicating flyer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;