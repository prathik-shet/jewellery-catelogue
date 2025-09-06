const express = require("express");
const router = express.Router();
const Jewellery = require("../models/Jewellery");

// Enhanced CORS middleware for better network support
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// CREATE jewellery item with multiple images and videos
router.post("/", async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      weight,
      image,
      images,
      videos,
      gender,
      stoneWeight,
      type,
      metal,
      carat,
      orderNo,
      isOurDesign,
    } = req.body;

    if (
      !id ||
      !name ||
      !category?.main ||
      weight === undefined ||
      !metal ||
      !carat
    ) {
      return res.status(400).json({
        error: "ID, name, main category, metal, carat, and weight are required.",
      });
    }

    let finalImages = [];
    if (images && Array.isArray(images)) {
      finalImages = images.slice(0, 10);
    } else if (image) {
      finalImages = [image];
    }

    let finalVideos = [];
    if (videos && Array.isArray(videos)) {
      finalVideos = videos.slice(0, 5);
    }

    const newItem = new Jewellery({
      id: id.trim(),
      name,
      category,
      weight: parseFloat(weight),
      image: finalImages[0] || null,
      images: finalImages,
      videos: finalVideos,
      gender: gender || "Unisex",
      stoneWeight: stoneWeight ? parseFloat(stoneWeight) : null,
      type: type || "normal",
      metal,
      carat: parseInt(carat),
      orderNo: orderNo !== undefined && orderNo !== null ? parseInt(orderNo) : null,
      isOurDesign: isOurDesign !== undefined ? Boolean(isOurDesign) : true,
      clickCount: 0,
      date: new Date(),
    });

    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving jewellery item:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Item with this ID already exists." });
    }
    res.status(500).json({ error: "Failed to add item: " + err.message });
  }
});

// PATCH route to increment click count (popularity)
router.patch("/:id/click", async (req, res) => {
  try {
    const updated = await Jewellery.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { clickCount: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.json({ 
      message: "Click count updated successfully.", 
      clickCount: updated.clickCount 
    });
  } catch (err) {
    console.error("Error updating click count:", err);
    res.status(500).json({ error: "Failed to update click count: " + err.message });
  }
});

// READ jewellery items with enhanced filters and sorting
router.get("/", async (req, res) => {
  try {
    const {
      type,
      catagories,
      subCategory,
      gender,
      minWeight,
      maxWeight,
      weightRanges,
      stone,
      metal,
      sortBy,
      sortField,
      sortOrder,
      sortByDate,
      order,
      search,
      searchId,
      isOurDesign,
      page = 1,
      pageSize = 20,
    } = req.query;

    const query = {};

    // Category Main - support multiple catagories
    if (catagories) {
      const categoryArray = Array.isArray(catagories) 
        ? catagories 
        : catagories.split(",").map((c) => c.trim()).filter(c => c);
      if (categoryArray && categoryArray.length > 0) {
        query["category.main"] = { $in: categoryArray };
      }
    }

    // Subcategory filter
    if (subCategory && subCategory.trim()) {
      query["category.sub"] = { $regex: subCategory.trim(), $options: "i" };
    }

    // Type filter
    if (type && type.trim() && type !== 'All') {
      query.type = { $regex: type.trim(), $options: "i" };
    }

    // Gender filter
    if (gender && gender.trim() && gender !== "All") {
      query.gender = gender.trim();
    }

    // Metal filter
    if (metal && metal.trim() && metal !== 'All') {
      query.metal = { $regex: metal.trim(), $options: "i" };
    }

    // Design ownership filter
    if (isOurDesign !== undefined && isOurDesign !== '') {
      query.isOurDesign = isOurDesign === 'true';
    }

    // Stone filter
    if (stone === "with") {
      query.stoneWeight = { $ne: null, $exists: true };
    } else if (stone === "without") {
      query.$or = [
        { stoneWeight: null },
        { stoneWeight: { $exists: false } }
      ];
    }

    // Search by Name
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Search by ID
    if (searchId && searchId.trim()) {
      query.id = { $regex: searchId.trim(), $options: "i" };
    }

    // Weight filter
    if (weightRanges) {
      const ranges = Array.isArray(weightRanges) 
        ? weightRanges 
        : weightRanges.split(',').map(r => r.trim());
      const weightConditions = [];
      ranges.forEach(range => {
        if (range.includes('-')) {
          const [min, max] = range.split('-');
          if (max === '+') {
            weightConditions.push({ weight: { $gte: parseFloat(min) } });
          } else {
            weightConditions.push({ 
              weight: { 
                $gte: parseFloat(min), 
                $lte: parseFloat(max) 
              } 
            });
          }
        }
      });
      if (weightConditions.length > 0) {
        query.$or = query.$or ? [...query.$or, ...weightConditions] : weightConditions;
      }
    } else if (minWeight || maxWeight) {
      query.weight = {};
      if (minWeight) query.weight.$gte = parseFloat(minWeight);
      if (maxWeight) query.weight.$lte = parseFloat(maxWeight);
    }

    // Enhanced Sorting Logic
    let sortOptions = {};
    if (sortByDate === 'newest') {
      sortOptions = { date: -1, _id: -1 };
    } else if (sortByDate === 'oldest') {
      sortOptions = { date: 1, _id: 1 };
    } else if (sortField && (sortField === 'weight' || sortField === 'orderNo' || sortField === 'clickCount')) {
      const direction = sortOrder === 'desc' ? -1 : 1;
      sortOptions = { [sortField]: direction, _id: direction };
    } else if (sortBy) {
      const allowedSortFields = ["weight", "stoneWeight", "date", "orderNo", "clickCount"];
      const field = allowedSortFields.includes(sortBy) ? sortBy : "clickCount";
      const direction = order === "desc" ? -1 : 1;
      sortOptions = { [field]: direction };
    } else {
      sortOptions = { clickCount: -1, _id: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const items = await Jewellery.aggregate([
      { $match: query },
      { 
        $addFields: {
          clickCount: { $ifNull: ["$clickCount", 0] },
          images: { 
            $cond: {
              if: { $isArray: "$images" },
              then: "$images",
              else: { $cond: { if: "$image", then: ["$image"], else: [] } }
            }
          },
          videos: { 
            $cond: {
              if: { $isArray: "$videos" },
              then: "$videos",
              else: []
            }
          }
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: parseInt(pageSize) }
    ]);

    const totalCount = await Jewellery.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(pageSize))
      }
    });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items: " + err.message });
  }
});

// UPDATE jewellery item with multiple images and videos
router.put("/:id", async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      weight,
      image,
      images,
      videos,
      gender,
      stoneWeight,
      type,
      metal,
      carat,
      orderNo,
      isOurDesign,
    } = req.body;

    if (
      !id ||
      !name ||
      !category?.main ||
      weight === undefined ||
      !metal ||
      !carat
    ) {
      return res.status(400).json({
        error: "ID, name, main category, metal, carat, and weight are required.",
      });
    }

    let finalImages = [];
    if (images && Array.isArray(images)) {
      finalImages = images.slice(0, 10);
    } else if (image) {
      finalImages = [image];
    }

    let finalVideos = [];
    if (videos && Array.isArray(videos)) {
      finalVideos = videos.slice(0, 5);
    }

    const updatedItem = {
      id: id.trim(),
      name,
      category,
      weight: parseFloat(weight),
      gender: gender || "Unisex",
      stoneWeight: stoneWeight ? parseFloat(stoneWeight) : null,
      type: type || "normal",
      metal,
      carat: parseInt(carat),
      orderNo: orderNo !== undefined && orderNo !== null ? parseInt(orderNo) : null,
      isOurDesign: isOurDesign !== undefined ? Boolean(isOurDesign) : true,
      updatedAt: new Date(),
    };

    if (finalImages.length > 0) {
      updatedItem.images = finalImages;
      updatedItem.image = finalImages[0];
    }

    if (finalVideos.length > 0) {
      updatedItem.videos = finalVideos;
    }

    const updated = await Jewellery.findByIdAndUpdate(
      req.params.id,
      updatedItem,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating item:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Item with this ID already exists." });
    }
    res.status(500).json({ error: "Failed to update item: " + err.message });
  }
});

// DELETE jewellery item
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Jewellery.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Item not found." });
    }
    res.json({ message: "Item deleted successfully.", deletedItem: deleted });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item: " + err.message });
  }
});

// GET statistics
router.get("/stats", async (req, res) => {
  try {
    const totalItems = await Jewellery.countDocuments();
    const totalWeight = await Jewellery.aggregate([
      { $group: { _id: null, total: { $sum: "$weight" } } }
    ]);
    const categoryStats = await Jewellery.aggregate([
      { $group: { _id: "$category.main", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const typeStats = await Jewellery.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const designStats = await Jewellery.aggregate([
      { $group: { _id: "$isOurDesign", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    const popularityStats = await Jewellery.aggregate([
      { $addFields: { clickCount: { $ifNull: ["$clickCount", 0] } } },
      { $sort: { clickCount: -1 } },
      { $limit: 10 },
      { $project: { name: 1, clickCount: 1, category: 1, isOurDesign: 1 } }
    ]);
    const mediaStats = await Jewellery.aggregate([
      {
        $project: {
          imageCount: { $size: { $ifNull: ["$images", []] } },
          videoCount: { $size: { $ifNull: ["$videos", []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalImages: { $sum: "$imageCount" },
          totalVideos: { $sum: "$videoCount" },
          itemsWithImages: { $sum: { $cond: [{ $gt: ["$imageCount", 0] }, 1, 0] } },
          itemsWithVideos: { $sum: { $cond: [{ $gt: ["$videoCount", 0] }, 1, 0] } }
        }
      }
    ]);
    res.json({
      totalItems,
      totalWeight: totalWeight[0]?.total || 0,
      categoryStats,
      typeStats,
      designStats,
      popularityStats,
      mediaStats: mediaStats[0] || { totalImages: 0, totalVideos: 0, itemsWithImages: 0, itemsWithVideos: 0 }
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics: " + err.message });
  }
});

module.exports = router;
