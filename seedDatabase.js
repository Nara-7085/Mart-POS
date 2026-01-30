const mongoose = require('mongoose');
const path = require('path');

// Import models
const Brand = require('./models/brands');

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mart-pos';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Sample data
const sampleBrands = [
  {
    name: 'Nike',
    description: 'Leading sports and athletic brand',
    image: 'nike.jpg',
    isActive: true,
  },
  {
    name: 'Adidas',
    description: 'International sports apparel brand',
    image: 'adidas.jpg',
    isActive: true,
  },
  {
    name: 'Puma',
    description: 'Sports and lifestyle brand',
    image: 'puma.jpg',
    isActive: true,
  },
  {
    name: 'Apple',
    description: 'Technology and electronics brand',
    image: 'apple.jpg',
    isActive: true,
  },
  {
    name: 'Samsung',
    description: 'Electronics and technology brand',
    image: 'samsung.jpg',
    isActive: true,
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Brand.deleteMany({});

    // Insert new data
    console.log('📝 Inserting new brands...');
    const insertedBrands = await Brand.insertMany(sampleBrands);
    console.log(`✓ Successfully inserted ${insertedBrands.length} brands`);

    // Display inserted data
    console.log('\n📊 Brands in database:');
    const allBrands = await Brand.find();
    console.table(allBrands);

    console.log('\n✅ Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seeding
seedDatabase();
