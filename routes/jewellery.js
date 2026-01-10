const express = require("express");
const router = express.Router();
const Jewellery = require("../models/Jewellery");
const upload = require("../server/middleware/upload"); // multer + s3

// ===============================
// CREATE JEWELLERY ITEM (S3)
// ===============================
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        id,
        name,
        category,
        weight,
        gender,
        stoneWeight,
        type,
        metal,
        carat,
        orderNo,
        isOurDesign,
      } = req.body;

      if (!id || !name || !category?.main || !weight || !metal || !carat) {
        return res.status(400).json({
          error: "ID, name, category, metal, carat and weight are required",
        });
      }

      const imageFiles = req.files?.images || [];
      const videoFiles = req.files?.videos || [];

      const images = imageFiles.map((f) => f.location);
      const videos = videoFiles.map((f) => f.location);

      const item = new Jewellery({
        id: id.trim(),
        name: name.trim(),
        category,
        weight: parseFloat(weight),
        images,
        image: images[0] || null, // backward compatibility
        videos,
        gender: gender || "Unisex",
        stoneWeight: stoneWeight ? parseFloat(stoneWeight) : null,
        type: type || "normal",
        metal,
        carat: parseInt(carat),
        orderNo: orderNo ? parseInt(orderNo) : null,
        isOurDesign:
          isOurDesign !== undefined ? Boolean(isOurDesign) : true,
      });

      const saved = await item.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error("Create error:", err);
      if (err.code === 11000) {
        return res.status(409).json({ error: "Duplicate jewellery ID" });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

// ===============================
// UPDATE JEWELLERY ITEM (S3)
// ===============================
router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        id,
        name,
        category,
        weight,
        gender,
        stoneWeight,
        type,
        metal,
        carat,
        orderNo,
        isOurDesign,
      } = req.body;

      if (!id || !name || !category?.main || !weight || !metal || !carat) {
        return res.status(400).json({
          error: "ID, name, category, metal, carat and weight are required",
        });
      }

      const imageFiles = req.files?.images || [];
      const videoFiles = req.files?.videos || [];

      const updateData = {
        id: id.trim(),
        name: name.trim(),
        category,
        weight: parseFloat(weight),
        gender: gender || "Unisex",
        stoneWeight: stoneWeight ? parseFloat(stoneWeight) : null,
        type: type || "normal",
        metal,
        carat: parseInt(carat),
        orderNo: orderNo ? parseInt(orderNo) : null,
        isOurDesign:
          isOurDesign !== undefined ? Boolean(isOurDesign) : true,
      };

      if (imageFiles.length > 0) {
        updateData.images = imageFiles.map((f) => f.location);
        updateData.image = updateData.images[0];
      }

      if (videoFiles.length > 0) {
        updateData.videos = videoFiles.map((f) => f.location);
      }

      const updated = await Jewellery.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ===============================
// CLICK COUNT
// ===============================
router.patch("/:id/click", async (req, res) => {
  try {
    const updated = await Jewellery.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ clickCount: updated.clickCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// READ JEWELLERY (FILTER + SORT)
// ===============================
router.get("/", async (req, res) => {
  try {
    const {
      type,
      catagories,
      subCategory,
      gender,
      weightRanges,
      stone,
      metal,
      sortField,
      sortOrder,
      search,
      searchId,
      design,
      page = 1,
      pageSize = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize)));
    const skip = (pageNum - 1) * pageSizeNum;

    const filters = [];

    if (catagories) {
      filters.push({
        "category.main": { $in: catagories.split(",").map((c) => c.trim()) },
      });
    }

    if (subCategory)
      filters.push({
        "category.sub": { $regex: subCategory, $options: "i" },
      });

    if (type && type !== "All")
      filters.push({ type: { $regex: type, $options: "i" } });

    if (gender && gender !== "All") filters.push({ gender });

    if (metal && metal !== "All")
      filters.push({ metal: { $regex: metal, $options: "i" } });

    if (design === "our") filters.push({ isOurDesign: true });
    if (design === "Others") filters.push({ isOurDesign: false });

    if (search)
      filters.push({ name: { $regex: search, $options: "i" } });

    if (searchId)
      filters.push({ id: { $regex: searchId, $options: "i" } });

    if (stone === "with") filters.push({ stoneWeight: { $gt: 0 } });
    if (stone === "without")
      filters.push({
        $or: [
          { stoneWeight: null },
          { stoneWeight: { $exists: false } },
          { stoneWeight: 0 },
        ],
      });

    if (weightRanges) {
      const ranges = weightRanges.split(",").map((r) => {
        if (r.endsWith("-+")) {
          return { weight: { $gte: parseFloat(r) } };
        }
        const [min, max] = r.split("-").map(Number);
        return { weight: { $gte: min, $lte: max } };
      });
      filters.push({ $or: ranges });
    }

    const query = filters.length ? { $and: filters } : {};

    const sort =
      sortField && sortField.trim()
        ? { [sortField]: sortOrder === "asc" ? 1 : -1 }
        : { clickCount: -1 };

    const [items, total] = await Promise.all([
      Jewellery.find(query).sort(sort).skip(skip).limit(pageSizeNum),
      Jewellery.countDocuments(query),
    ]);

    res.json({
      items,
      totalItems: total,
      totalPages: Math.ceil(total / pageSizeNum),
      page: pageNum,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// DELETE ITEM
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Jewellery.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// STATS
// ===============================
router.get("/stats", async (req, res) => {
  try {
    const totalItems = await Jewellery.countDocuments();
    const popularity = await Jewellery.find()
      .sort({ clickCount: -1 })
      .limit(10)
      .select("name clickCount category");

    res.json({ totalItems, popularity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
