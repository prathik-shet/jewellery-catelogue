import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

/* ===============================
   Pagination Helper
================================ */
function getPaginationRange(current, total) {
  const delta = 2;
  const range = [];
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  for (let i = left; i <= right; i++) range.push(i);
  if (left > 1) range.unshift(1);
  if (right < total) range.push(total);

  return [...new Set(range)];
}

/* ===============================
   Main Component
================================ */
export default function UserCatalogue() {
  /* ---------- Data ---------- */
  const [jewellery, setJewellery] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Pagination ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /* ---------- Filters ---------- */
  const [categories, setCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");
  const [metal, setMetal] = useState("");
  const [stone, setStone] = useState("");
  const [design, setDesign] = useState("");
  const [weightRange, setWeightRange] = useState([0, 200]);

  /* ---------- Search ---------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchId, setSearchId] = useState("");

  /* ---------- Sorting ---------- */
  const [sortBy, setSortBy] = useState(""); // date | weight
  const [sortOrder, setSortOrder] = useState(""); // asc | desc

  /* ---------- Grid ---------- */
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4);

  /* ---------- UI ---------- */
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  /* ===============================
     Device Check
  ================================ */
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setGridCols(2);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ===============================
     Grid Toggle
  ================================ */
  const toggleGrid = () => {
    setGridCols((prev) => {
      if (isMobile) return prev === 1 ? 2 : 1;
      if (prev === 2) return 3;
      if (prev === 3) return 4;
      if (prev === 4) return 6;
      return 2;
    });
  };

  /* ===============================
     Fetch Jewellery
  ================================ */
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("pageSize", pageSize);

      if (categories.length) params.append("categories", categories.join(","));
      if (subCategory) params.append("subCategory", subCategory);
      if (type) params.append("type", type);
      if (gender) params.append("gender", gender);
      if (metal) params.append("metal", metal);
      if (stone) params.append("stone", stone);
      if (design) params.append("design", design);
      if (weightRange) params.append("weight", weightRange.join("-"));
      if (searchQuery) params.append("search", searchQuery);
      if (searchId) params.append("searchId", searchId);
      if (sortBy) {
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
      }

      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      setJewellery(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error(err);
      setJewellery([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    categories,
    subCategory,
    type,
    gender,
    metal,
    stone,
    design,
    weightRange,
    searchQuery,
    searchId,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    categories,
    subCategory,
    type,
    gender,
    metal,
    stone,
    design,
    weightRange,
    searchQuery,
    searchId,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  /* ===============================
     WhatsApp Share
  ================================ */
  const shareOnWhatsApp = (item) => {
    const msg = `
✨ *VIMALESHWARA JEWELLERS* ✨

📿 Name: ${item.name}
🆔 ID: ${item.id}
📂 Category: ${item.category}
🔖 Type: ${item.type}
👤 Gender: ${item.gender}
🪙 Purity: ${item.purity}
⚖️ Weight: ${item.weight} g
💎 Stone Weight: ${item.stoneWeight || 0} g
🏪 Design: ${item.designOwnership}

📸 Image:
${item.image}
`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  /* ===============================
     UI
  ================================ */
  return (
    <div className="min-h-screen bg-[#fff8e6]">
      {/* Header */}
      <header className="bg-[#fae382] p-4 flex justify-between items-center shadow">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Playfair Display", color: "#2e2e2e" }}
        >
          VIMALESHWARA JEWELLERS
        </h1>
      </header>

      {/* Search Bar */}
      <div className="p-4 flex gap-2 items-center">
        <input
          className="flex-1 p-2 rounded border"
          placeholder="Search jewellery..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={toggleGrid}
          className="px-3 py-2 bg-[#efb20c] rounded font-bold"
        >
          Grid
        </button>
      </div>

      {/* Grid */}
      <div
        className={`grid gap-4 p-4 ${
          gridCols === 1
            ? "grid-cols-1"
            : gridCols === 2
            ? "grid-cols-2"
            : gridCols === 3
            ? "grid-cols-3"
            : gridCols === 4
            ? "grid-cols-4"
            : "grid-cols-6"
        }`}
      >
        {loading ? (
          <p>Loading...</p>
        ) : (
          jewellery.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded shadow p-2 cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-40 w-full object-cover rounded"
              />
              <h2 className="font-semibold mt-2">{item.name}</h2>
              <p className="text-sm">{item.weight} g</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 p-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          {getPaginationRange(currentPage, totalPages).map((p) => (
            <button
              key={p}
              className={`px-3 ${
                p === currentPage ? "bg-[#efb20c]" : ""
              }`}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-xl font-bold mb-2">{selectedItem.name}</h2>
            <p>ID: {selectedItem.id}</p>
            <p>Category: {selectedItem.category}</p>
            <p>Type: {selectedItem.type}</p>
            <p>Gender: {selectedItem.gender}</p>
            <p>Purity: {selectedItem.purity}</p>
            <p>Weight: {selectedItem.weight} g</p>
            <p>Stone Weight: {selectedItem.stoneWeight} g</p>
            <p>Design: {selectedItem.designOwnership}</p>

            <button
              onClick={() => shareOnWhatsApp(selectedItem)}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded"
            >
              Share on WhatsApp
            </button>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-2 w-full border py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
