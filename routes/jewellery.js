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
      id, name, category, weight, image, images, videos, gender,
      stoneWeight, type, metal, carat, orderNo, isOurDesign,
    } = req.body;

    if (!id || !name || !category?.main || weight === undefined || !metal || !carat) {
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
      type, catagories, subCategory, gender,
      weightRanges, stone, metal, sortField, sortOrder,
      sortByDate, search, searchId, design,
      page = 1,
      pageSize = 20,
    } = req.query;

    // Enhanced parameter validation and conversion
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 20));
    const skip = (pageNum - 1) * pageSizeNum;

    let query = {};
    const andConditions = [];

    // Category Main - support multiple categories
    if (catagories) {
      const categoryArray = catagories.split(",").map((c) => c.trim()).filter(c => c);
      if (categoryArray.length > 0) {
        andConditions.push({ "category.main": { $in: categoryArray } });
      }
    }

    // Add simple key-value filters to the 'and' array
    if (subCategory && subCategory.trim()) {
      andConditions.push({ "category.sub": { $regex: subCategory.trim(), $options: "i" } });
    }
    if (type && type.trim() && type !== 'All') {
      andConditions.push({ type: { $regex: type.trim(), $options: "i" } });
    }
    if (gender && gender.trim() && gender !== "All") {
      andConditions.push({ gender: gender.trim() });
    }
    if (metal && metal.trim() && metal !== 'All') {
      andConditions.push({ metal: { $regex: metal.trim(), $options: "i" } });
    }
    if (design === 'our') {
      andConditions.push({ isOurDesign: true });
    } else if (design === 'Others') {
      andConditions.push({ isOurDesign: false });
    }
    if (search && search.trim()) {
      andConditions.push({ name: { $regex: search.trim(), $options: "i" } });
    }
    if (searchId && searchId.trim()) {
      andConditions.push({ id: { $regex: searchId.trim(), $options: "i" } });
    }

    // Stone filter
    if (stone === "with") {
      andConditions.push({ stoneWeight: { $gt: 0 } });
    } else if (stone === "without") {
      andConditions.push({
        $or: [
          { stoneWeight: null },
          { stoneWeight: { $exists: false } },
          { stoneWeight: 0 }
        ]
      });
    }

    // Weight ranges filter
    if (weightRanges) {
        const ranges = weightRanges.split(',').map(r => r.trim());
        const weightConditions = ranges.map(range => {
            if (range.endsWith('-+')) {
                const min = parseFloat(range.replace('-+', ''));
                return { weight: { $gte: min } };
            }
            const [min, max] = range.split('-').map(parseFloat);
            return { weight: { $gte: min, $lte: max } };
        });
        if (weightConditions.length > 0) {
            andConditions.push({ $or: weightConditions });
        }
    }
    
    if (andConditions.length > 0) {
        query = { $and: andConditions };
    }

    // FIXED: Enhanced Sorting Logic with proper field validation
    let sortOptions = {};
    if (sortByDate === 'newest') {
      sortOptions = { date: -1, _id: -1 };
    } else if (sortByDate === 'oldest') {
      sortOptions = { date: 1, _id: 1 };
    } else if (sortField && sortField.trim()) {  // RESTORED: .trim() check
      const direction = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortField]: direction, _id: direction };
    } else {
      // Default sort by popularity (most popular first)
      sortOptions = { clickCount: -1, _id: -1 };
    }

    console.log(`Pagination Debug: Page ${pageNum}, PageSize ${pageSizeNum}, Skip ${skip}`);
    console.log(`Sort Options:`, sortOptions);
    console.log(`Query:`, JSON.stringify(query));

    const [result] = await Jewellery.aggregate([
      { $match: query },
      { 
        $addFields: {
          // FIXED: Ensure clickCount is properly normalized for sorting
          clickCount: { 
            $cond: {
              if: { $type: "$clickCount" },
              then: "$clickCount",
              else: 0
            }
          },
          // FIXED: Ensure images and videos are properly handled
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
      {
        $facet: {
          items: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: pageSizeNum }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ], { 
      allowDiskUse: true, // Allow disk usage for large sorts
      maxTimeMS: 30000 // Set reasonable timeout
    });

    const totalItems = result.totalCount[0]?.count || 0;
    const items = result.items || [];
    const totalPages = Math.ceil(totalItems / pageSizeNum);

    console.log(`Pagination Result: Total Items ${totalItems}, Items Returned ${items.length}, Total Pages ${totalPages}`);
    console.log(`Sort Field: ${sortField}, Sort Order: ${sortOrder}, Sort By Date: ${sortByDate}`);

    // Validate that the requested page is within bounds
    if (pageNum > totalPages && totalPages > 0) {
      return res.status(400).json({ 
        error: `Page ${pageNum} does not exist. Maximum page is ${totalPages}.`,
        totalPages,
        totalItems
      });
    }

    // KEPT: Fixed pagination structure from new code
    res.json({
      items,
      totalItems,
      totalPages,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalCount: totalItems,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
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
      id, name, category, weight, image, images, videos, gender,
      stoneWeight, type, metal, carat, orderNo, isOurDesign,
    } = req.body;

    if (!id || !name || !category?.main || weight === undefined || !metal || !carat) {
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