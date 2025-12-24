const mongoose = require('mongoose');

const flyerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  template: {
    type: String,
    required: true,
    enum: ['modern', 'classic', 'minimalist', 'colorful'],
    default: 'modern'
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    displayName: String,
    displayPrice: Number,
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  design: {
    colors: {
      primary: {
        type: String,
        default: '#007bff'
      },
      secondary: {
        type: String,
        default: '#6c757d'
      },
      background: {
        type: String,
        default: '#ffffff'
      },
      text: {
        type: String,
        default: '#212529'
      }
    },
    fonts: {
      heading: {
        type: String,
        default: 'Arial'
      },
      body: {
        type: String,
        default: 'Arial'
      }
    },
    layout: {
      type: String,
      enum: ['grid', 'list', 'carousel'],
      default: 'grid'
    }
  },
  businessInfo: {
    name: String,
    logo: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    hours: String
  },
  images: {
    preview: String,
    fullSize: String,
    thumbnail: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
flyerSchema.index({ createdBy: 1 });
flyerSchema.index({ status: 1 });
flyerSchema.index({ isPublic: 1 });
flyerSchema.index({ createdAt: -1 });
flyerSchema.index({ publishedAt: -1 });
flyerSchema.index({ expiresAt: 1 });

// Text search
flyerSchema.index({
  title: 'text',
  description: 'text'
});

module.exports = mongoose.model('Flyer', flyerSchema);