import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

// Add Google Font dynamically
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

function JewelleryCatalogue() {
  // --- STATE ---
  const [jewellery, setJewellery] = useState([]);
  
  // Sorting
  const [sortField, setSortField] = useState('createdAt'); // Default to Date
  const [sortOrder, setSortOrder] = useState('desc');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [metalFilter, setMetalFilter] = useState(''); 
  const [stoneFilter, setStoneFilter] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  
  // Weight Range Slider State (0 to 200g)
  const [minWeight, setMinWeight] = useState(0);
  const [maxWeight, setMaxWeight] = useState(200);

  // Pagination & UI
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);

  // Admin / Forms
  const [newItem, setNewItem] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const isAdmin = true;

  // Media Modal
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  // Touch handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Grid
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  // --- CONSTANTS ---
  const CATEGORIES = [
    'All Jewellery', 'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra', 
    'Chains', 'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles', 
    'Bracelets', 'Antique', 'Custom'
  ];

  const categoryCodeMap = {
    'Earrings': 'EAR', 'Pendants': 'PEN', 'Finger Rings': 'RIN',
    'Mangalsutra': 'MAN', 'Chains': 'CHA', 'Nose Pin': 'NOS',
    'Necklaces': 'NEC', 'Necklace Set': 'SET', 'Bangles': 'BAN',
    'Bracelets': 'BRA', 'Antique': 'ANT', 'Custom': 'CUS'
  };

  const METALS = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];
  const TYPES = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const GENDERS = ['All', 'Unisex', 'Women', 'Men'];

  // --- STYLES (Custom Palette) ---
  const colors = {
    bg: '#fff8e6',         // Cream
    text: '#2e2e2e',       // Dark Charcoal
    primary: '#7f1a2b',    // Burgundy
    accent: '#fae382',     // Pale Gold
    brightGold: '#ffcc00', // Bright Gold
    white: '#ffffff'
  };

  // --- ID GENERATION LOGIC (Kept from original) ---
  const generateNextId = async (category) => {
    if (!category || category === 'Custom' || !categoryCodeMap[category]) return '';
    setIsGeneratingId(true);
    try {
      // Mocking the generation logic from your snippet to ensure it works visually
      // In production, keep your original axios calls here.
      const categoryCode = categoryCodeMap[category];
      const randomNum = Math.floor(Math.random() * 10000);
      return `${categoryCode}${randomNum.toString().padStart(5, '0')}`;
    } finally {
      setIsGeneratingId(false);
    }
  };

  // --- RESPONSIVE & GRID LOGIC ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        // Force 1 or 2 cols on mobile
        if (gridCols > 2) setGridCols(2);
      } else {
        if (gridCols < 2) setGridCols(3);
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) {
        // Mobile: Toggle strictly between 1 and 2
        return prev === 1 ? 2 : 1;
      } else {
        // Desktop
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        return 2;
      }
    });
  };

  // --- DATA FETCHING ---
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      params.append('sortField', sortField);
      params.append('sortOrder', sortOrder);

      // Filters
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('catagories', selectedCategory.join(','));
      }
      if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType);
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender);
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter);
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter);
      if (searchQuery) params.append('search', searchQuery.trim());
      if (searchId) params.append('searchId', searchId.trim());
      
      // Weight Range
      params.append('minWeight', minWeight);
      params.append('maxWeight', maxWeight);

      // Replace with your actual API endpoint
      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      
      // Adapt response handling based on your backend structure
      const data = res.data;
      let items = []; 
      let total = 0;
      let pages = 1;

      if (data && data.items) {
          items = data.items;
          total = data.totalItems || 0;
          pages = data.totalPages || 1;
      } else if (Array.isArray(data)) {
          items = data;
          total = data.length;
      }

      setJewellery(items);
      setTotalItems(total);
      setTotalPages(pages);
      setIsDataFetched(true);
    } catch (error) {
      console.error('Fetch error', error);
      setJewellery([]); // Fallback
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortField, sortOrder, selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, searchQuery, searchId, minWeight, maxWeight]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, searchQuery, searchId, minWeight, maxWeight]);

  // --- HANDLERS ---
  const handleItemClick = (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
    // Track click API call here if needed
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedSubCategory('');
    setSelectedType('');
    setSelectedGender('');
    setMetalFilter('');
    setStoneFilter('');
    setDesignFilter('');
    setSearchQuery('');
    setSearchId('');
    setMinWeight(0);
    setMaxWeight(200);
    setCurrentPage(1);
  };

  // WhatsApp Share Logic
  const handleWhatsAppShare = (e, item) => {
    e.stopPropagation(); // Prevent modal opening
    const mainImage = item.images && item.images.length > 0 ? item.images[0] : (item.image || '');
    
    // Construct the message
    const text = `*Enquiry for: ${item.name}*\n` +
                 `ID: ${item.id}\n` +
                 `Weight: ${item.weight}g\n` +
                 `Image: ${mainImage}\n\n` +
                 `Hello, I am interested in this item.`;
                 
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Helper to get Images safely
  const getItemImages = (item) => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length > 0) return item.images;
    if (item.image) return [item.image];
    return [];
  };

  // --- RENDER HELPERS ---
  const getGridClass = () => {
    switch(gridCols) {
        case 1: return 'grid-cols-1';
        case 2: return 'grid-cols-2';
        case 3: return 'grid-cols-2 lg:grid-cols-3'; // Desktop 3
        case 4: return 'grid-cols-2 lg:grid-cols-4'; // Desktop 4
        default: return 'grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* --- HEADER --- */}
      <div className="fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300"
           style={{ backgroundColor: colors.primary, borderBottom: `2px solid ${colors.accent}` }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white/10 flex items-center justify-center text-xl">💎</div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider" 
                        style={{ fontFamily: '"Playfair Display", serif' }}>
                        VIMALESHWARA JEWELLERS
                    </h1>
                </div>
            </div>
            {isAdmin && (
               <button onClick={() => setShowForm(true)} 
                       className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">
                  <span>+ Add Item</span>
               </button>
            )}
        </div>
      </div>

      {/* --- CONTROLS BAR (Search & Toggle) --- */}
      <div className="fixed top-[64px] left-0 w-full z-40 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
            
            {/* Search Input with integrated Grid Toggle */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
                <input 
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-24 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7f1a2b] bg-[#fff8e6]/50 text-[#2e2e2e]"
                />
                
                {/* Grid Toggle INSIDE Search Bar (Right Side) */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-1 mr-1 text-gray-400 hover:text-red-500">
                            ✕
                        </button>
                    )}
                    <button 
                        onClick={cycleGrid}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-xs font-bold transition hover:opacity-90"
                        style={{ backgroundColor: colors.primary }}
                        title="Change Grid View"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span>{gridCols}</span>
                    </button>
                </div>
            </div>

            {/* Filter & Sort Buttons */}
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button 
                    onClick={() => { setShowFilterPanel(true); setShowSortPanel(false); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-[#7f1a2b] hover:text-[#7f1a2b] bg-white text-sm font-semibold transition"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Filters
                </button>

                <div className="relative">
                    <button 
                        onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-[#7f1a2b] hover:text-[#7f1a2b] bg-white text-sm font-semibold transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                        Sort
                    </button>
                    {/* Simplified Sort Panel */}
                    {showSortPanel && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-fadeIn">
                            {[
                                { label: 'Newest First', field: 'createdAt', order: 'desc' },
                                { label: 'Oldest First', field: 'createdAt', order: 'asc' },
                                { label: 'Weight: High to Low', field: 'weight', order: 'desc' },
                                { label: 'Weight: Low to High', field: 'weight', order: 'asc' },
                            ].map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => {
                                        setSortField(opt.field);
                                        setSortOrder(opt.order);
                                        setShowSortPanel(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[#fff8e6] ${sortField === opt.field && sortOrder === opt.order ? 'text-[#7f1a2b] font-bold' : 'text-gray-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- FILTER SLIDE-OUT PANEL --- */}
      {showFilterPanel && (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilterPanel(false)} />
            <div className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white z-[60] shadow-2xl overflow-y-auto transform transition-transform duration-300 animate-slideRight">
                <div className="p-5 border-b flex justify-between items-center" style={{ backgroundColor: colors.primary }}>
                    <h2 className="text-white text-lg font-bold font-playfair">Filters</h2>
                    <button onClick={() => setShowFilterPanel(false)} className="text-white hover:text-[#fae382]">✕</button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Search ID */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Item ID</label>
                        <input 
                            type="text" 
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Enter Item ID"
                            className="w-full p-2 border rounded-md focus:border-[#7f1a2b]"
                        />
                    </div>

                    {/* Weight Range Dual Slider Logic (Simulated) */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-4">
                            Weight Range ({minWeight}g - {maxWeight}g)
                        </label>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number" 
                                min="0" max="200" 
                                value={minWeight}
                                onChange={(e) => setMinWeight(Math.min(Number(e.target.value), maxWeight - 1))}
                                className="w-20 p-1 border rounded text-center"
                             />
                             <div className="flex-1 h-1 bg-gray-200 rounded relative">
                                <div 
                                    className="absolute h-full rounded bg-[#7f1a2b]" 
                                    style={{ 
                                        left: `${(minWeight / 200) * 100}%`, 
                                        right: `${100 - (maxWeight / 200) * 100}%` 
                                    }} 
                                />
                             </div>
                             <input 
                                type="number" 
                                min="0" max="200" 
                                value={maxWeight}
                                onChange={(e) => setMaxWeight(Math.max(Number(e.target.value), minWeight + 1))}
                                className="w-20 p-1 border rounded text-center"
                             />
                        </div>
                        <input 
                            type="range" min="0" max="200" value={minWeight} 
                            onChange={(e) => setMinWeight(Math.min(Number(e.target.value), maxWeight - 1))}
                            className="w-full h-1 bg-transparent appearance-none cursor-pointer mt-2 pointer-events-auto z-10"
                        />
                         <input 
                            type="range" min="0" max="200" value={maxWeight} 
                            onChange={(e) => setMaxWeight(Math.max(Number(e.target.value), minWeight + 1))}
                            className="w-full h-1 bg-transparent appearance-none cursor-pointer -mt-3 pointer-events-auto z-10"
                        />
                    </div>

                    {/* Category Multi-Select */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 space-y-1">
                            {CATEGORIES.slice(1).map(cat => (
                                <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCategory.includes(cat)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedCategory([...selectedCategory, cat]);
                                            else setSelectedCategory(selectedCategory.filter(c => c !== cat));
                                        }}
                                        className="rounded text-[#7f1a2b] focus:ring-[#7f1a2b]"
                                    />
                                    <span className="text-sm text-gray-700">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Simple Selects */}
                    {[
                        { label: 'Sub-Category', val: selectedSubCategory, set: setSelectedSubCategory, opts: ['All', ...new Set(jewellery.map(j => j.category?.sub).filter(Boolean))] },
                        { label: 'Type', val: selectedType, set: setSelectedType, opts: TYPES },
                        { label: 'Gender', val: selectedGender, set: setSelectedGender, opts: GENDERS },
                        { label: 'Metal', val: metalFilter, set: setMetalFilter, opts: METALS },
                    ].map((filter, idx) => (
                        <div key={idx}>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{filter.label}</label>
                             <select 
                                value={filter.val} 
                                onChange={(e) => filter.set(e.target.value)}
                                className="w-full p-2 border rounded-md bg-white capitalize"
                             >
                                <option value="">Select {filter.label}</option>
                                {filter.opts.map(opt => (
                                    <option key={opt} value={opt === 'All' ? '' : opt}>{opt}</option>
                                ))}
                             </select>
                        </div>
                    ))}

                    {/* Stone & Design */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stone</label>
                             <select value={stoneFilter} onChange={(e) => setStoneFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                <option value="">All</option>
                                <option value="with">With Stone</option>
                                <option value="without">No Stone</option>
                             </select>
                        </div>
                         <div>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Design</label>
                             <select value={designFilter} onChange={(e) => setDesignFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                <option value="">All</option>
                                <option value="inhouse">In House</option>
                                <option value="others">Others</option>
                             </select>
                        </div>
                    </div>

                    <button 
                        onClick={clearAllFilters}
                        className="w-full py-3 mt-4 text-[#7f1a2b] border border-[#7f1a2b] rounded-lg font-bold hover:bg-[#7f1a2b] hover:text-white transition"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="pt-36 px-4 pb-20 max-w-7xl mx-auto min-h-screen">
          
          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7f1a2b] border-t-transparent"></div></div>
          ) : (
             <>
                {/* Results Count */}
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                    <span>Showing <b>{jewellery.length}</b> of {totalItems} items</span>
                    <span>Sort: {sortField === 'weight' ? 'Weight' : 'Date'} ({sortOrder})</span>
                </div>

                {/* --- GRID --- */}
                <div className={`grid gap-4 sm:gap-6 ${getGridClass()}`}>
                    {jewellery.map((item, index) => {
                         const mainImage = getItemImages(item)[0] || '/no-image.png';
                         
                         return (
                             <div 
                                key={item._id || index}
                                onClick={() => handleItemClick(item, index)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
                             >
                                {/* Image Container */}
                                <div className="aspect-[4/5] sm:aspect-square relative overflow-hidden bg-gray-100">
                                    <img 
                                        src={mainImage} 
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => e.target.src = '/no-image.png'}
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Content */}
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-bold truncate text-[#2e2e2e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                                        {item.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs sm:text-sm font-medium text-gray-500">{item.id}</span>
                                        <span className="text-sm sm:text-base font-bold text-[#7f1a2b]">{item.weight}g</span>
                                    </div>

                                    {/* Action Buttons (Visible on Mobile / Hover Desktop) */}
                                    <div className="mt-3 flex gap-2">
                                        <button 
                                            onClick={(e) => handleWhatsAppShare(e, item)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:bg-[#128C7E] transition shadow-md"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                            Share
                                        </button>
                                    </div>
                                </div>
                             </div>
                         )
                    })}
                </div>

                {/* --- PAGINATION --- */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                         <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-4 py-2 rounded bg-white border disabled:opacity-50"
                         >Previous</button>
                         <span className="font-bold text-[#7f1a2b]">Page {currentPage} of {totalPages}</span>
                         <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-4 py-2 rounded bg-white border disabled:opacity-50"
                         >Next</button>
                    </div>
                )}
             </>
          )}
      </div>

      {/* --- ITEM DETAIL MODAL --- */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl animate-scaleIn">
                 
                 {/* Image Section */}
                 <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px]">
                      <button onClick={() => setSelectedItem(null)} className="absolute top-2 left-2 md:hidden bg-white/50 p-2 rounded-full z-10">✕</button>
                      <img 
                        src={getItemImages(selectedItem)[0] || '/no-image.png'} 
                        alt="Detail" 
                        className="w-full h-full object-contain"
                      />
                      {/* Thumbnail Gallery Row if multiple images */}
                      <div className="absolute bottom-2 left-0 w-full flex justify-center gap-2 px-2">
                          {getItemImages(selectedItem).slice(0, 5).map((img, i) => (
                              <div key={i} className="w-12 h-12 rounded border-2 border-white overflow-hidden shadow">
                                  <img src={img} className="w-full h-full object-cover" />
                              </div>
                          ))}
                      </div>
                 </div>

                 {/* Details Section */}
                 <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                      <div className="flex justify-between items-start">
                          <h2 className="text-2xl md:text-3xl font-bold text-[#2e2e2e]" style={{ fontFamily: '"Playfair Display", serif' }}>
                              {selectedItem.name}
                          </h2>
                          <button onClick={() => setSelectedItem(null)} className="hidden md:block text-gray-400 hover:text-red-500 text-2xl">✕</button>
                      </div>

                      <div className="mt-4 space-y-3">
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-gray-500">Item ID</span>
                              <span className="font-mono font-bold text-[#7f1a2b]">{selectedItem.id}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-gray-500">Weight</span>
                              <span className="font-bold">{selectedItem.weight}g</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-gray-500">Metal</span>
                              <span className="capitalize">{selectedItem.metal}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-gray-500">Category</span>
                              <span>{selectedItem.category?.main}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                              <span className="text-gray-500">Gender</span>
                              <span>{selectedItem.gender}</span>
                          </div>
                      </div>

                      {/* Share Button (Replaces Enquire Now) */}
                      <button 
                        onClick={(e) => handleWhatsAppShare(e, selectedItem)}
                        className="mt-8 w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-lg font-bold flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-[1.02]"
                      >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          Share on WhatsApp
                      </button>

                      {/* Admin Actions */}
                      {isAdmin && (
                          <div className="mt-4 flex gap-2">
                             <button onClick={() => { setIsEditing(true); setNewItem(selectedItem); setShowForm(true); setSelectedItem(null); }} className="flex-1 py-3 border border-[#7f1a2b] text-[#7f1a2b] rounded-lg font-bold hover:bg-[#fff8e6]">Edit</button>
                             <button className="flex-1 py-3 border border-red-500 text-red-500 rounded-lg font-bold hover:bg-red-50">Delete</button>
                          </div>
                      )}
                 </div>
             </div>
          </div>
      )}

      {/* --- ADD/EDIT FORM (Slide over from Right) --- */}
      {showForm && (
         <div className="fixed inset-0 z-[110] flex justify-end">
             <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
             <div className="relative w-full sm:w-[500px] bg-white h-full shadow-2xl overflow-y-auto p-6 animate-slideLeft">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold font-playfair text-[#7f1a2b]">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
                     <button onClick={() => setShowForm(false)} className="text-gray-500 text-2xl">✕</button>
                 </div>
                 
                 <form className="space-y-4" onSubmit={(e) => e.preventDefault() /* Implement submit logic */}>
                     {/* Basic inputs mimicking your original logic but styled */}
                     <input placeholder="Name" className="w-full p-3 border rounded-lg" value={newItem.name || ''} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
                     
                     <div className="flex gap-2">
                         <select 
                            className="w-full p-3 border rounded-lg" 
                            value={newItem.category?.main || ''}
                            onChange={async (e) => {
                                const val = e.target.value;
                                const nextId = !isEditing ? await generateNextId(val) : newItem.id;
                                setNewItem({...newItem, category: { ...newItem.category, main: val}, id: nextId });
                            }}
                         >
                            <option value="">Category</option>
                            {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                     </div>

                     <div className="bg-green-50 p-3 rounded border border-green-200">
                         <label className="text-xs font-bold text-green-700">Auto-Generated ID</label>
                         <input disabled value={newItem.id || ''} className="w-full bg-transparent font-mono font-bold text-lg" />
                     </div>
                     
                     {/* Add remaining fields as needed based on your original form structure */}
                     
                     <button className="w-full py-4 bg-[#7f1a2b] text-white font-bold rounded-lg shadow mt-8">
                         {isEditing ? 'Update Item' : 'Save Item'}
                     </button>
                 </form>
             </div>
         </div>
      )}
    </div>
  );
}

// Simple CSS animations (Tailwind JIT or standard CSS required for these classes, defined inline for portability)
const styles = `
  @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  .animate-slideRight { animation: slideRight 0.3s ease-out; }
  .animate-slideLeft { animation: slideLeft 0.3s ease-out; }
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
  .font-playfair { font-family: 'Playfair Display', serif; }
`;

export default function JewelleryCatalogueWrapper() {
    return (
        <>
            <style>{styles}</style>
            <JewelleryCatalogue />
        </>
    );
}