const mongoose = require("mongoose");

const jewellerySchema = new mongoose.Schema(
  {
    // 🔑 Custom readable ID (SKU / Product ID)
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // 🏷️ Jewellery Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 🗂️ Category structure
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

    // 🎨 Usage type
    type: {
      type: String,
      enum: ["festival", "lightweight", "daily wear", "fancy", "normal"],
      default: "normal",
    },

    // 🪙 Metal details
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

    // ⚖️ Weight details
    weight: {
      type: Number,
      required: true,
    },

    stoneWeight: {
      type: Number,
      default: null,
    },

    // 🚻 Target gender
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      default: "Unisex",
    },

    // 🖼️ Image URLs (AWS S3)
    images: {
      type: [String], // S3 URLs
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10;
        },
        message: "Maximum 10 images allowed per item",
      },
    },

    // 🎥 Video URLs (AWS S3)
    videos: {
      type: [String], // S3 URLs
      default: [],
      validate: {
        validator: function (videos) {
          return videos.length <= 5;
        },
        message: "Maximum 5 videos allowed per item",
      },
    },

    // 🧩 Backward compatibility (legacy single image)
    image: {
      type: String,
      default: null,
    },

    // 🎨 Ownership flag
    isOurDesign: {
      type: Boolean,
      default: true,
      required: true,
    },

    // 🔢 Optional ordering
    orderNo: {
      type: Number,
      sparse: true,
    },

    // 🔥 Popularity tracking
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto-handled
  }
);

// ✅ Ensure main image is always included in images array
jewellerySchema.pre("save", function (next) {
  if (this.image && !this.images.includes(this.image)) {
    this.images.unshift(this.image);
  }
  next();
});

module.exports = mongoose.model("Jewellery", jewellerySchema);
