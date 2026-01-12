const express = require("express");
const router = express.Router();
const Jewellery = require("../models/Jewellery");

// ===============================
// CREATE JEWELLERY ITEM (URL ONLY)
// ===============================
router.post("/", async (req, res) => {
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
      images = [],
      videos = [],
    } = req.body;

    if (!id || !name || !category?.main || !weight || !metal || !carat) {
      return res.status(400).json({
        error: "ID, name, category, weight, metal and carat are required",
      });
    }

    const finalImages = Array.isArray(images)
      ? images.filter(Boolean)
      : [];

    const finalVideos = Array.isArray(videos)
      ? videos.filter(Boolean)
      : [];

    const item = new Jewellery({
      id: id.trim(),
      name: name.trim(),
      category: {
        main: category.main,
        sub: category.sub || "",
      },
      weight: Number(weight),
      images: finalImages,
      image: finalImages[0] || null, // ✅ MAIN IMAGE
      videos: finalVideos,
      gender: gender || "Unisex",
      stoneWeight: stoneWeight ? Number(stoneWeight) : null,
      type: type || "normal",
      metal,
      carat: Number(carat),
      orderNo: orderNo || null,
      isOurDesign: isOurDesign !== false,
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// UPDATE JEWELLERY ITEM (URL ONLY)
// ===============================
router.put("/:id", async (req, res) => {
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
      images = [],
      videos = [],
    } = req.body;

    if (!id || !name || !category?.main || !weight || !metal || !carat) {
      return res.status(400).json({
        error: "ID, name, category, weight, metal and carat are required",
      });
    }

    const finalImages = Array.isArray(images)
      ? images.filter(Boolean)
      : [];

    const finalVideos = Array.isArray(videos)
      ? videos.filter(Boolean)
      : [];

    const updateData = {
      id: id.trim(),
      name: name.trim(),
      category: {
        main: category.main,
        sub: category.sub || "",
      },
      weight: Number(weight),
      gender: gender || "Unisex",
      stoneWeight: stoneWeight ? Number(stoneWeight) : null,
      type: type || "normal",
      metal,
      carat: Number(carat),
      orderNo: orderNo || null,
      isOurDesign: isOurDesign !== false,
      images: finalImages,
      image: finalImages[0] || null, // ✅ KEEP MAIN IMAGE IN SYNC
      videos: finalVideos,
      updatedAt: new Date(),
    };

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
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

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
        "category.main": { $in: catagories.split(",").map(c => c.trim()) },
      });
    }

    if (subCategory)
      filters.push({ "category.sub": { $regex: subCategory, $options: "i" } });

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

   // weight range checkboxes (optional support)
if (req.query.weightRanges) {
  const ranges = req.query.weightRanges.split(",").map(r => {
    if (r.includes("+")) {
      const min = Number(r.replace("+", ""));
      return { weight: { $gte: min } };
    }

    const [min, max] = r.split("-").map(Number);
    return { weight: { $gte: min, $lte: max } };
  });

  filters.push({ $or: ranges });
}

// ✅ NEW: Min–Max weight filter (PRIMARY)
const weightMin = Number(req.query.weightMin);
const weightMax = Number(req.query.weightMax);

if (!isNaN(weightMin) || !isNaN(weightMax)) {
  filters.push({
    weight: {
      ...( !isNaN(weightMin) && { $gte: weightMin } ),
      ...( !isNaN(weightMax) && { $lte: weightMax } )
    }
  });
}


    const query = filters.length ? { $and: filters } : {};
    const sort = sortField
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

module.exports = router;
