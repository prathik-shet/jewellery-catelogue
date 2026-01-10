import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DualRangeSlider from './DualRangeSlider';

// Inject Google Font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

function UserCatalogue() {
  // --- Data State ---
  const [jewellery, setJewellery] = useState([]);
  
  // --- Sort State ---
  const [sortField, setSortField] = useState('createdAt'); // Default to Date
  const [sortOrder, setSortOrder] = useState('desc');

  // --- Filter State ---
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [stoneFilter, setStoneFilter] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  const [weightRange, setWeightRange] = useState([0, 200]); // FIXED: Removed TS Syntax
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');

  // --- Pagination & Loading ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // --- UI State ---
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(2);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  // --- Touch State ---
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- Constants ---
  const categories = ['All Jewellery', 'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra', 'Chains', 'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles', 'Bracelets', 'Antique', 'Custom'];
  const genders = ['All', 'Unisex', 'Women', 'Men'];
  const types = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];

  // --- Colors (For inline styles if needed) ---
  const colors = {
    cream: '#fff8e6',
    charcoal: '#2e2e2e',
    burgundy: '#7f1a2b',
    paleGold: '#fae382',
    brightGold: '#ffcc00'
  };

  // --- Device & Grid Logic ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        // Mobile: Force 1 or 2 cols
        if (gridCols > 2) setGridCols(2);
      } else {
        // Desktop: Min 2 cols
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
        return prev === 1 ? 2 : 1;
      } else {
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        return 2;
      }
    });
  };

  const getGridClasses = () => {
    if (isMobile) {
      return gridCols === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2';
    } else {
      switch (gridCols) {
        case 2: return 'grid grid-cols-2 lg:grid-cols-2';
        case 3: return 'grid grid-cols-2 lg:grid-cols-3';
        case 4: return 'grid grid-cols-2 lg:grid-cols-4';
        default: return 'grid grid-cols-2 lg:grid-cols-3';
      }
    }
  };

  // --- API Fetching ---
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    setIsDataFetched(false);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      params.append('sortField', sortField);
      params.append('sortOrder', sortOrder);

      // Filters
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('categories', selectedCategory.join(','));
      }
      if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType);
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender);
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter);
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter);
      if (searchQuery) params.append('search', searchQuery.trim());
      if (searchId) params.append('searchId', searchId.trim());
      
      // Weight
      params.append('minWeight', weightRange[0].toString());
      params.append('maxWeight', weightRange[1].toString());

      // Replace with your actual endpoint
      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      
      // Handle response structure variances
      const data = res.data;
      let items = [];
      let total = 0;
      let pages = 1;

      if (data) {
        if (Array.isArray(data)) {
          items = data;
          total = data.length;
          pages = Math.ceil(total / itemsPerPage);
        } else if (data.items) {
          items = data.items;
          total = data.totalItems || 0;
          pages = data.totalPages || 1;
        }
      }

      setJewellery(items);
      setTotalItems(total);
      setTotalPages(pages);
    } catch (error) {
      console.error('Failed to load jewellery:', error);
      setJewellery([]); 
    } finally {
      setLoading(false);
      setIsDataFetched(true);
    }
  }, [
    currentPage, itemsPerPage, sortField, sortOrder, selectedCategory, 
    selectedSubCategory, selectedType, selectedGender, metalFilter, 
    stoneFilter, designFilter, weightRange, searchQuery, searchId
  ]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightRange, searchQuery, searchId, sortField, sortOrder]);

  // --- Handlers ---
  const handleItemClick = async (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/jewellery/${item._id}/click`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // Silent fail for popularity update
    }
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
    setWeightRange([0, 200]);
    setCurrentPage(1);
  };

  // WhatsApp Share Logic
  const shareOnWhatsApp = (item) => {
    const mainImage = getItemImages(item)[0] || '';
    
    // Formatting the message for WhatsApp
    // Note: WhatsApp renders the link preview from the *first* URL found in the text.
    const message = `Hello, I'm interested in this item from Vimaleshwara Jewellers:
    
*${item.name}*
ID: ${item.id}
Weight: ${item.weight}g

${mainImage} 

Please let me know the price and availability.`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Media Helpers
  const getItemImages = (item) => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length > 0) return item.images.filter(Boolean);
    if (item.image) return [item.image];
    return [];
  };

  const getMainImage = (item) => {
    const images = getItemImages(item);
    return images.length > 0 ? images[0] : null;
  };

  const getItemMedia = (item) => {
    if (!item) return [];
    const media = [];
    getItemImages(item).forEach(img => media.push({ type: 'image', src: img }));
    if(Array.isArray(item.videos)) item.videos.forEach(vid => media.push({ type: 'video', src: vid }));
    return media;
  };

  const getSubCategoriesForMainCategory = () => {
    if (selectedCategory.length === 0) return [];
    // Filter jewellery list to find subcats of selected main cats
    const subs = jewellery
      .filter(j => selectedCategory.includes(j.category?.main))
      .map(j => j.category?.sub)
      .filter(Boolean);
    return [...new Set(subs)].sort();
  };

  // Pagination Handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sort Options
  const sortOptions = [
    { label: 'Date: Newest First', field: 'createdAt', order: 'desc' },
    { label: 'Date: Oldest First', field: 'createdAt', order: 'asc' },
    { label: 'Weight: High to Low', field: 'weight', order: 'desc' },
    { label: 'Weight: Low to High', field: 'weight', order: 'asc' },
  ];

  const currentSortLabel = sortOptions.find(o => o.field === sortField && o.order === sortOrder)?.label || 'Sort By';

  // --- Modal Navigation ---
  const navigateToItem = (dir) => {
    let newIndex = dir === 'next' ? selectedItemIndex + 1 : selectedItemIndex - 1;
    if(newIndex >= jewellery.length) newIndex = 0;
    if(newIndex < 0) newIndex = jewellery.length - 1;
    
    setSelectedItem(jewellery[newIndex]);
    setSelectedItemIndex(newIndex);
  };

  // Media Modal Nav
  const navigateMedia = (dir) => {
    let newIndex = dir === 'next' ? currentMediaIndex + 1 : currentMediaIndex - 1;
    if(newIndex >= modalMedia.length) newIndex = 0;
    if(newIndex < 0) newIndex = modalMedia.length - 1;
    setCurrentMediaIndex(newIndex);
  };

  const closeMediaModal = () => {
    setModalMedia([]);
    setCurrentMediaIndex(0);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream, color: colors.charcoal }}>
      
      {/* --- HEADER --- */}
      <div className="fixed top-0 left-0 w-full z-[90] shadow-xl transition-all duration-300"
           style={{ backgroundColor: colors.burgundy, borderBottom: `4px solid ${colors.paleGold}` }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img src="logo.png" alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg" onError={e => e.target.style.display='none'} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white" style={{ backgroundColor: colors.brightGold }}></div>
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider" 
                        style={{ fontFamily: '"Playfair Display", serif', color: colors.paleGold }}>
                        VIMALESHWARA JEWELLERS
                    </h1>
                    <p className="text-white/80 text-xs tracking-widest uppercase">Premium Collection</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTROLS BAR (Search, Filter, Sort) --- */}
      <div className="fixed top-[72px] left-0 w-full z-[85] bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
            
            {/* Search Input with Integrated Grid Toggle */}
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
                <input 
                    type="text"
                    placeholder="Search jewellery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-24 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7f1a2b] bg-[#fff8e6]/30 text-[#2e2e2e] shadow-inner"
                />
                
                {/* Grid Toggle INSIDE Search Bar (Right Side) */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-red-500">✕</button>
                    )}
                    <button 
                        onClick={cycleGrid}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition hover:opacity-90 shadow-sm"
                        style={{ backgroundColor: colors.burgundy }}
                        title="Change Grid View"
                    >
                        {/* Grid Icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {gridCols === 1 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" />
                            )}
                        </svg>
                        <span className="hidden sm:inline">{gridCols} Col</span>
                    </button>
                </div>
            </div>

            {/* Filter & Sort Buttons */}
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 justify-end">
                {/* Filter Button */}
                <button 
                    onClick={() => { setShowFilterPanel(true); setShowSortPanel(false); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition hover:scale-105"
                    style={{ backgroundColor: colors.burgundy }}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-[#2e2e2e] text-sm font-bold shadow-md transition hover:border-[#7f1a2b]"
                    >
                        <svg className="w-4 h-4 text-[#7f1a2b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        Sort
                    </button>
                    
                    {/* Modern Sort Panel */}
                    {showSortPanel && (
                        <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 overflow-hidden animate-fadeIn">
                            <div className="text-xs font-bold text-gray-400 uppercase px-3 py-2">Sort By</div>
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => {
                                        setSortField(opt.field);
                                        setSortOrder(opt.order);
                                        setShowSortPanel(false);
                                    }}
                                    className={`w-full text-left px-3 py-3 text-sm rounded-lg transition-colors flex justify-between items-center ${
                                        sortField === opt.field && sortOrder === opt.order 
                                        ? 'bg-[#fff8e6] text-[#7f1a2b] font-bold' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {opt.label}
                                    {sortField === opt.field && sortOrder === opt.order && <span>✓</span>}
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
            <div className="fixed inset-0 bg-black/50 z-[95]" onClick={() => setShowFilterPanel(false)} />
            <div className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white z-[100] shadow-2xl overflow-y-auto transition-transform duration-300">
                <div className="p-5 flex justify-between items-center text-white" style={{ backgroundColor: colors.burgundy }}>
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display' }}>Filters</h2>
                    <button onClick={() => setShowFilterPanel(false)} className="text-2xl hover:text-gray-300">×</button>
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
                            className="w-full p-3 border rounded-lg focus:border-[#7f1a2b] outline-none bg-gray-50"
                        />
                    </div>

                    {/* Weight Range Dual Slider */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-4">
                            Weight Range
                        </label>
                        <DualRangeSlider 
                            min={0} 
                            max={200} 
                            value={weightRange} 
                            onChange={setWeightRange} 
                        />
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                        <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50 space-y-1">
                            {categories.slice(1).map(cat => (
                                <label key={cat} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCategory.includes(cat)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedCategory([...selectedCategory, cat]);
                                            else setSelectedCategory(selectedCategory.filter(c => c !== cat));
                                        }}
                                        className="w-4 h-4 rounded text-[#7f1a2b] focus:ring-[#7f1a2b]"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Sub Category */}
                    {selectedCategory.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sub-Category</label>
                            <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} className="w-full p-3 border rounded-lg bg-white outline-none focus:border-[#7f1a2b]">
                                <option value="">All Sub-Categories</option>
                                {getSubCategoriesForMainCategory().map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Dropdowns Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { label: 'Type', val: selectedType, set: setSelectedType, opts: types },
                            { label: 'Gender', val: selectedGender, set: setSelectedGender, opts: genders },
                            { label: 'Metal', val: metalFilter, set: setMetalFilter, opts: metals },
                        ].map((f, i) => (
                            <div key={i}>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{f.label}</label>
                                <select value={f.val} onChange={e => f.set(e.target.value)} className="w-full p-3 border rounded-lg bg-white capitalize outline-none focus:border-[#7f1a2b]">
                                    <option value="">All {f.label}s</option>
                                    {f.opts.map(o => <option key={o} value={o === 'All' ? '' : o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Stone & Design */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stone</label>
                             <select value={stoneFilter} onChange={(e) => setStoneFilter(e.target.value)} className="w-full p-3 border rounded-lg bg-white outline-none">
                                <option value="">All</option>
                                <option value="with">With Stone</option>
                                <option value="without">No Stone</option>
                             </select>
                        </div>
                         <div>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Design</label>
                             <select value={designFilter} onChange={(e) => setDesignFilter(e.target.value)} className="w-full p-3 border rounded-lg bg-white outline-none">
                                <option value="">All</option>
                                <option value="our">In House</option>
                                <option value="Others">Others</option>
                             </select>
                        </div>
                    </div>

                    <button 
                        onClick={clearAllFilters}
                        className="w-full py-4 mt-4 text-[#7f1a2b] border-2 border-[#7f1a2b] rounded-xl font-bold hover:bg-[#7f1a2b] hover:text-white transition uppercase tracking-wide"
                    >
                        Clear All Filters
                    </button>
                </div>
            </div>
        </>
      )}

      {/* --- MAIN CONTENT GRID --- */}
      <div className="pt-40 px-4 pb-20 max-w-7xl mx-auto">
          
          {loading && (
             <div className="flex flex-col items-center justify-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7f1a2b] border-t-transparent"></div>
                 <p className="mt-4 text-[#7f1a2b] font-medium">Loading Collection...</p>
             </div>
          )}

          {!loading && isDataFetched && (
             <>
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-sm font-medium text-gray-500">
                        Found <b className="text-[#2e2e2e]">{totalItems}</b> items
                    </span>
                    <span className="text-sm font-medium text-[#7f1a2b] bg-[#fff8e6] px-3 py-1 rounded-lg border border-[#fae382]">
                        {currentSortLabel}
                    </span>
                </div>

                {jewellery.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                        <div className="text-6xl mb-4">💎</div>
                        <h3 className="text-xl font-bold text-[#2e2e2e]">No items found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                        <button onClick={clearAllFilters} className="text-[#7f1a2b] font-bold underline">Reset Everything</button>
                    </div>
                ) : (
                    <div className={`grid gap-4 sm:gap-6 ${getGridClasses()}`}>
                        {jewellery.map((item, index) => {
                             const mainImage = getMainImage(item) || '/no-image.png';
                             
                             return (
                                 <div 
                                    key={item._id || index}
                                    onClick={() => handleItemClick(item, index)}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 flex flex-col"
                                 >
                                    {/* Image */}
                                    <div className={`relative overflow-hidden bg-gray-100 ${isMobile && gridCols===1 ? 'h-64' : 'h-48 sm:h-56'}`}>
                                        <img 
                                            src={mainImage} 
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                                        />
                                        
                                        {/* Overlay Tags */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {item.isOurDesign !== false && (
                                                <span className="bg-[#7f1a2b] text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">In House</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-bold text-[#2e2e2e] truncate" style={{ fontFamily: 'Playfair Display' }}>
                                                {item.name}
                                            </h3>
                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <span className="text-gray-400 font-mono text-xs">{item.id}</span>
                                                <span className="text-[#7f1a2b] font-bold bg-[#fff8e6] px-2 py-0.5 rounded border border-[#fae382]">{item.weight}g</span>
                                            </div>
                                        </div>

                                        {/* WhatsApp Button (Replacing Enquire) */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); shareOnWhatsApp(item); }}
                                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#128C7E] transition shadow-md active:scale-95"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                            Share
                                        </button>
                                    </div>
                                 </div>
                             )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                         <button 
                            disabled={currentPage === 1}
                            onClick={() => goToPage(currentPage - 1)}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 font-bold text-[#7f1a2b]"
                         >Previous</button>
                         <span className="text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
                         <button 
                            disabled={currentPage === totalPages}
                            onClick={() => goToPage(currentPage + 1)}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 font-bold text-[#7f1a2b]"
                         >Next</button>
                    </div>
                )}
             </>
          )}
      </div>

      {/* --- ITEM DETAIL MODAL --- */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl relative">
                 
                 {/* Close Button Mobile */}
                 <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 md:hidden bg-white/80 p-2 rounded-full shadow">✕</button>

                 {/* Image Section */}
                 <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px] flex items-center justify-center">
                      <img 
                        src={getMainImage(selectedItem) || 'https://via.placeholder.com/400'} 
                        alt="Detail" 
                        className="w-full h-full object-contain cursor-zoom-in"
                        onClick={() => setModalMedia(getItemMedia(selectedItem))}
                      />
                      {/* Nav Arrows Overlay */}
                      <button onClick={(e) => {e.stopPropagation(); navigateToItem('prev')}} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white">←</button>
                      <button onClick={(e) => {e.stopPropagation(); navigateToItem('next')}} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white">→</button>
                 </div>

                 {/* Details Section */}
                 <div className="w-full md:w-1/2 p-8 flex flex-col">
                      <div className="flex justify-between items-start">
                          <h2 className="text-3xl font-bold text-[#2e2e2e]" style={{ fontFamily: 'Playfair Display' }}>
                              {selectedItem.name}
                          </h2>
                          <button onClick={() => setSelectedItem(null)} className="hidden md:block text-2xl text-gray-400 hover:text-red-500">×</button>
                      </div>

                      <div className="mt-6 space-y-4 text-sm">
                          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                              <span className="text-gray-500 font-bold uppercase">ID</span>
                              <span className="font-mono text-[#7f1a2b] font-bold">{selectedItem.id}</span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                              <span className="text-gray-500 font-bold uppercase">Weight</span>
                              <span className="text-lg font-bold">{selectedItem.weight}g</span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                              <span className="text-gray-500 font-bold uppercase">Metal</span>
                              <span className="capitalize">{selectedItem.metal}</span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                              <span className="text-gray-500 font-bold uppercase">Type</span>
                              <span className="capitalize">{selectedItem.type}</span>
                          </div>
                          <div className="flex justify-between border-b border-dashed border-gray-300 pb-2">
                              <span className="text-gray-500 font-bold uppercase">Gender</span>
                              <span>{selectedItem.gender}</span>
                          </div>
                      </div>

                      <div className="mt-auto pt-8">
                          <button 
                            onClick={() => shareOnWhatsApp(selectedItem)}
                            className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-lg font-bold flex items-center justify-center gap-3 shadow-xl transition transform hover:-translate-y-1"
                          >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              Share on WhatsApp
                          </button>
                      </div>
                 </div>
             </div>
          </div>
      )}

      {/* --- MEDIA GALLERY MODAL --- */}
      {modalMedia.length > 0 && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col justify-center items-center">
              <button onClick={closeMediaModal} className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-50">×</button>
              
              <div className="relative w-full h-full flex items-center justify-center">
                  <button onClick={() => navigateMedia('prev')} className="absolute left-4 text-white text-3xl bg-white/20 p-3 rounded-full hover:bg-white/40">‹</button>
                  
                  {modalMedia[currentMediaIndex].type === 'image' ? (
                      <img 
                        src={modalMedia[currentMediaIndex].src} 
                        className="max-w-full max-h-[90vh] object-contain" 
                        alt="Gallery" 
                      />
                  ) : (
                      <video 
                        src={modalMedia[currentMediaIndex].src} 
                        controls autoPlay 
                        className="max-w-full max-h-[90vh]" 
                      />
                  )}

                  <button onClick={() => navigateMedia('next')} className="absolute right-4 text-white text-3xl bg-white/20 p-3 rounded-full hover:bg-white/40">›</button>
              </div>
              <div className="text-white pb-4">{currentMediaIndex + 1} / {modalMedia.length}</div>
          </div>
      )}
    </div>
  );
}

export default UserCatalogue;