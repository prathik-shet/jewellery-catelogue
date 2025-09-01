const mongoose = require("mongoose");

const jewellerySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    main: {
      type: String,
      required: true,
      trim: true,
    },
    sub: {
      type: String,
      default: null,
      trim: true,
    },
  },

  type: {
    type: String,
    enum: ["festival", "lightweight", "daily wear", "fancy", "normal"],
    default: "normal",
  },

  metal: {
    type: String,
    enum: ["gold", "silver", "diamond", "platinum", "rose gold"],
    required: true,
  },

  carat: {
    type: Number,
    enum: [22, 18],
    required: true,
  },

  weight: {
    type: Number,
    required: true,
  },

  stoneWeight: {
    type: Number,
    default: null,
  },

  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    default: 'Unisex',
  },

  // ✅ Multiple images support
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images) {
        return images.length <= 10; // Maximum 10 images per item
      },
      message: 'Maximum 10 images allowed per item'
    }
  },

  // ✅ NEW: Multiple videos support
  videos: {
    type: [String],
    default: [],
    validate: {
      validator: function(videos) {
        return videos.length <= 5; // Maximum 5 videos per item
      },
      message: 'Maximum 5 videos allowed per item'
    }
  },

  // ✅ Maintain backward compatibility
  image: {
    type: String,
    default: null
  },

  // ✅ Design ownership tracking
  isOurDesign: {
    type: Boolean,
    default: true,
    required: true
  },

  date: {
    type: Date,
    default: Date.now,
  },

  orderNo: {
    type: Number,
    required: false,
    sparse: true, // Allows multiple null values
  },

  // ✅ Click count for popularity
  clickCount: {
    type: Number,
    default: 0,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// ✅ Pre-save middleware to ensure images array includes the main image
jewellerySchema.pre('save', function(next) {
  if (this.image && !this.images.includes(this.image)) {
    this.images.unshift(this.image);
  }
  next();
});

module.exports = mongoose.model("Jewellery", jewellerySchema);