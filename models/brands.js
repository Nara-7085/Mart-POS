const mongoose = require('mongoose');

// Define Brand Schema
const brandSchema = new mongoose.Schema(
  {
    brand_name: {
      type: String,
      required: [true, 'Please provide a brand name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export Brand Model
module.exports = mongoose.model('Brand', brandSchema);
