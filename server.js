const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Brand = require('./models/brands');

const app = express();

// Middleware
app.use(express.json());

// Serve static files from project root so HTML pages are reachable
app.use(
  express.static(path.join(__dirname), {
    index: false,
  })
);

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mart-pos';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => console.error('✗ MongoDB connection error:', err.message));

// Add this route before app.listen()
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    server: 'running',
    mongodb: mongoStatus,
    database: mongoose.connection.name || 'N/A'
  });
});

// ===== BRANDS ROUTES =====

// POST - Create new brand
app.post('/api/brands', async (req, res) => {
  try {
    const { brand_name, name, description, image } = req.body;
    const brandName = brand_name || name;

    // Validate required fields
    if (!brandName) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    // Create new brand (support both `brand_name` and legacy `name`)
    const brand = new Brand({
      brand_name: brandName,
      description,
      image,
    });

    // Save to MongoDB
    await brand.save();
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET - Get all brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET - Get single brand by ID
app.get('/api/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT - Update brand
app.put('/api/brands/:id', async (req, res) => {
  try {
    const { brand_name, name, description, image, isActive } = req.body;
    const brandName = brand_name || name;
    const update = { description, image, isActive };
    if (brandName) update.brand_name = brandName;

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE - Delete brand
app.delete('/api/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});