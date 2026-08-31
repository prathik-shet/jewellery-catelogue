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

router.post("/bulk-import", async (req, res) => {
  try {
    console.log('📥 BULK IMPORT REQUEST RECEIVED');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    const rawItems = Array.isArray(req.body?.items)
      ? req.body.items
      : Array.isArray(req.body?.images)
        ? req.body.images
        : [];

    console.log('📥 Raw items extracted:', rawItems.length, 'items');
    console.log('📥 Raw items content:', JSON.stringify(rawItems, null, 2));

    const urlCandidates = rawItems.flatMap((item) => {
      if (typeof item === 'string') return [item];
      if (item && typeof item === 'object') {
        const values = [
          item.image,
          item.imageUrl,
          item.imageURL,
          item.img,
          item.url,
          item.link,
          item.Image,
          item['Image URL'],
          item['image url'],
        ];
        return values.filter((value) => typeof value === 'string' || typeof value === 'number');
      }
      return [];
    });

    console.log('📥 URL candidates found:', urlCandidates.length);

    const validImages = [...new Set(
      urlCandidates
        .map((value) => String(value).trim())
        .filter((value) => value && /^https?:\/\//i.test(value))
    )];

    console.log('✅ Valid images after validation:', validImages.length);
    console.log('✅ Valid images:', JSON.stringify(validImages, null, 2));

    if (!validImages.length) {
      console.log('❌ NO VALID IMAGES - RETURNING 400');
      return res.status(400).json({
        error: "No valid image URLs were found. Please upload an Excel/CSV file with image links.",
      });
    }

    const bulkItems = validImages.map((url, index) => ({
      id: `BULK${Date.now()}${String(index + 1).padStart(4, '0')}`,
      name: `Bulk Image ${index + 1}`,
      category: {
        main: 'Custom',
        sub: 'Bulk Upload',
      },
      weight: 0,
      gender: 'Unisex',
      stoneWeight: 0,
      type: 'normal',
      metal: 'Gold',
      carat: 22,
      orderNo: null,
      isOurDesign: true,
      images: [url],
      image: url,
      videos: [],
      clickCount: 0,
    }));

    console.log('📦 About to insert', bulkItems.length, 'items into database');
    const created = await Jewellery.insertMany(bulkItems, { ordered: false });

    console.log('✅ Successfully inserted', created.length, 'items');
    res.status(201).json({
      inserted: created.length,
      message: 'Bulk image items uploaded successfully.',
      items: created,
    });
  } catch (err) {
    console.error('BULK IMPORT ERROR:', err);
    res.status(500).json({ error: err.message || 'Bulk import failed' });
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

// ===============================
// DOWNLOAD IMAGE (CORS BYPASS)
// ===============================
router.get("/download-image/proxy", async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Fetch image from S3 (server-side, no CORS issues)
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch image" });
    }

    const buffer = await response.arrayBuffer();

    // Set headers for download
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${filename || 'image.jpg'}"`);
    res.setHeader("Content-Length", buffer.byteLength);

    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download image" });
  }
});

module.exports = router;