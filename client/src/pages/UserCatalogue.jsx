import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function UserCatalogue() {
  // --- STATE MANAGEMENT ---
  const [jewellery, setJewellery] = useState([]);
  
  // Sorting State (Restricted to Date & Weight only)
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [sortByDate, setSortByDate] = useState('newest'); // 'newest' | 'oldest' | ''
  const [sortField, setSortField] = useState(''); // 'weight' | '' (removed popularity/orderNo)

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState([]); // Multi-select
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [stoneFilter, setStoneFilter] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  const [weightRanges, setWeightRanges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  // Modal & Media State
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Grid State
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4); // Default desktop
  
  // UI State
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  
  // Selected Item (Modal) State
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  
  // Touch Handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- CONSTANTS ---
  const COLORS = {
    headerBg: '#fae382',
    brandText: '#2e2e2e',
    primaryBtn: '#7f1a2b',
    secondary: '#ffcc00'
  };

  const catagories = [
    'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra', 'Chains', 
    'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles', 'Bracelets', 
    'Antique', 'Custom'
  ]; // Removed 'All Jewellery' to force explicit selection if needed
  
  const genders = ['All', 'Unisex', 'Women', 'Men'];
  const types = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];

  // --- GRID SYSTEM ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Initialize Grid defaults
      if (mobile && gridCols > 2) setGridCols(2);
      if (!mobile && gridCols < 2) setGridCols(4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  // 1️⃣ GRID RULES (FINAL)
  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) {
        // Mobile: ONLY 1 <-> 2
        return prev === 1 ? 2 : 1;
      } else {
        // Desktop: 2 -> 3 -> 4 -> 6
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        if (prev === 4) return 6;
        return 2;
      }
    });
  };

  const getGridClasses = () => {
    // Tailwind Arbitrary values used to enforce strict grid columns
    if (isMobile) {
        return gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2';
    }
    switch (gridCols) {
      case 2: return 'grid-cols-2 lg:grid-cols-2';
      case 3: return 'grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-2 lg:grid-cols-4';
      case 6: return 'grid-cols-3 lg:grid-cols-6';
      default: return 'grid-cols-2 lg:grid-cols-4';
    }
  };

  const getImageHeightClasses = () => {
     if (isMobile) {
       return gridCols === 1 ? 'h-64' : 'h-40';
     }
     // Desktop heights
     switch (gridCols) {
       case 2: return 'h-72';
       case 3: return 'h-64';
       case 4: return 'h-56';
       case 6: return 'h-40';
       default: return 'h-56';
     }
  };

  // --- API FETCHING ---
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    setIsDataFetched(false);
    try {
      const params = new URLSearchParams();
      
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      
      // 4️⃣ SORTING (FINAL)
      // Only Date or Weight allowed
      if (sortByDate) {
        params.append('sortByDate', sortByDate);
      } else if (sortField === 'weight') {
        params.append('sortField', 'weight');
        params.append('sortOrder', sortOrder);
      } else {
        // Default fall back to newest if nothing selected
         params.append('sortByDate', 'newest');
      }

      // Filters
      if (selectedCategory.length > 0) params.append('catagories', selectedCategory.join(','));
      if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType);
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender);
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter);
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter);
      if (weightRanges.length > 0) params.append('weightRanges', weightRanges.join(','));
      if (searchQuery) params.append('search', searchQuery.trim());
      if (searchId) params.append('searchId', searchId.trim());

      // console.log('API URL:', `/api/jewellery?${params.toString()}`);
      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      // Data extraction logic (keeping existing robustness)
      let items = [];
      let total = 0;
      let pages = 1;

      if (data) {
        if (Array.isArray(data)) {
           items = data; total = data.length;
        } else if (data.items || data.data || data.jewellery) {
           items = data.items || data.data || data.jewellery;
           total = data.totalItems || data.total || data.count || 0;
           pages = data.totalPages || 1;
        } else if (data.pagination) {
            items = data.items;
            total = data.pagination.totalCount;
            pages = data.pagination.totalPages;
        }
      }

      setJewellery(items || []);
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
    currentPage, itemsPerPage, sortField, sortOrder, sortByDate,
    selectedCategory, selectedSubCategory, selectedType, selectedGender,
    metalFilter, stoneFilter, designFilter, weightRanges, searchQuery, searchId
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightRanges, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // --- ITEM HANDLERS & NAVIGATION ---
  const handleItemClick = (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
  };

  const navigateToItem = (direction) => {
    let newIndex = selectedItemIndex;
    if (direction === 'next') {
      newIndex = selectedItemIndex + 1 >= jewellery.length ? 0 : selectedItemIndex + 1;
    } else {
      newIndex = selectedItemIndex - 1 < 0 ? jewellery.length - 1 : selectedItemIndex - 1;
    }
    
    if (jewellery[newIndex]) {
        handleItemClick(jewellery[newIndex], newIndex);
    }
  };

  // Keyboard Nav
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedItem) return;
      if (e.key === 'ArrowLeft') navigateToItem('prev');
      if (e.key === 'ArrowRight') navigateToItem('next');
      if (e.key === 'Escape') setSelectedItem(null);
    };
    if (selectedItem) document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedItem, selectedItemIndex, jewellery]);

  // Touch Swipe
  const onTouchStartHandler = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMoveHandler = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) navigateToItem('next');
    if (distance < -50) navigateToItem('prev');
  };

  // --- HELPERS ---
  const getItemImages = (item) => item?.images?.filter(Boolean) || (item?.image ? [item.image] : []);
  const getItemVideos = (item) => item?.videos?.filter(Boolean) || [];
  const getMainImage = (item) => getItemImages(item)[0] || null;
  
  const getItemMedia = (item) => {
    if (!item) return [];
    return [
      ...getItemImages(item).map(src => ({ type: 'image', src })),
      ...getItemVideos(item).map(src => ({ type: 'video', src }))
    ];
  };

  // 3️⃣ WHATSAPP SHARE (FINAL)
  const handleWhatsAppShare = () => {
    if (!selectedItem) return;

    // Get the first valid image URL
    const imgUrl = getMainImage(selectedItem) || 'No Image Available';
    
    // Construct the formatted message
    const text = `*${selectedItem.name}*\nID: ${selectedItem.id || selectedItem._id || 'N/A'}\nWeight: ${selectedItem.weight}g\n\nView Image: ${imgUrl}`;
    
    // Use the encodeURIComponent to ensure special characters work
    const encodedText = encodeURIComponent(text);
    
    // Open WhatsApp Web/App
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  // Filter Helpers
  const getFilteredSubcatagories = () => {
    const relevantItems = selectedCategory.length === 0 ? jewellery : jewellery.filter(item => selectedCategory.includes(item.category?.main));
    const subs = relevantItems.map(i => i.category?.sub).filter(s => s).filter((v, i, a) => a.indexOf(v) === i);
    return subs.sort();
  };

  const clearAllFilters = () => {
    setSelectedCategory([]); setSelectedSubCategory(''); setSelectedType('');
    setSelectedGender(''); setMetalFilter(''); setStoneFilter(''); setDesignFilter('');
    setWeightRanges([]); setSearchQuery(''); setSearchId(''); setCurrentPage(1);
  };

  // Sort Helpers
  const getActiveSortDescription = () => {
      if (sortByDate === 'newest') return 'Date: Newest';
      if (sortByDate === 'oldest') return 'Date: Oldest';
      if (sortField === 'weight') return sortOrder === 'desc' ? 'Weight: High to Low' : 'Weight: Low to High';
      return 'Date: Newest';
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-amber-50">
      
      {/* 2️⃣ HEADER (FINAL COLOR) */}
      <div 
        style={{ backgroundColor: COLORS.headerBg, borderBottom: `1px solid ${COLORS.secondary}` }}
        className="fixed top-0 left-0 w-full z-[90] shadow-md p-4"
      >
        <div className="flex items-center gap-4 justify-center sm:justify-start">
          <img src="logo.png" alt="Logo" className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm" />
          <div className="text-center sm:text-left">
            <h1 
                style={{ color: COLORS.brandText }}
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wide"
            >
              VIMALESHWARA JEWELLERS
            </h1>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-white/95 backdrop-blur-md fixed top-20 left-0 w-full z-[85] shadow-lg p-3 sm:p-4 border-b border-gray-200">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Search & Grid Toggle */}
          <div className="relative mb-3">
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Search jewellery by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-24 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm font-medium"
                />
                
                {/* 1️⃣ GRID TOGGLE INSIDE SEARCH BAR (RIGHT) */}
                <button
                    onClick={cycleGrid}
                    style={{ color: COLORS.brandText }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors flex items-center gap-1 border border-gray-300"
                >
                    {/* Simple Grid Icons */}
                    {gridCols === 1 && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
                    {gridCols === 2 && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" /></svg>}
                    {gridCols >= 3 && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4M4 12h4M4 18h4M10 6h4M10 12h4M10 18h4M16 6h4M16 12h4M16 18h4" /></svg>}
                    <span className="text-xs font-bold">{gridCols}</span>
                </button>
            </div>
          </div>

          {/* Filter & Sort Buttons */}
          <div className="flex gap-2 justify-center">
             {/* Filter Button */}
             <button
                onClick={() => { setShowFilterPanel(!showFilterPanel); setShowSortPanel(false); }}
                style={{ backgroundColor: COLORS.primaryBtn }}
                className="text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 flex-1 justify-center sm:flex-none"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                FILTERS
             </button>

             {/* Sort Button */}
             <button
                onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
                style={{ backgroundColor: COLORS.primaryBtn }}
                className="text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 flex-1 justify-center sm:flex-none"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                SORT
             </button>
          </div>

          {/* 5️⃣ FILTERS PANEL */}
          {showFilterPanel && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 shadow-xl rounded-b-xl p-4 max-h-[70vh] overflow-y-auto z-[80]">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Categories (Multi-Select) */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-2">Categories</h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {catagories.map(cat => (
                                <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        value={cat}
                                        checked={selectedCategory.includes(cat)}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedCategory(prev => e.target.checked ? [...prev, val] : prev.filter(v => v !== val));
                                        }}
                                        className="rounded text-red-800 focus:ring-red-800"
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Basic Selects */}
                    <div className="space-y-3">
                        <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} className="w-full p-2 border rounded">
                             <option value="">Sub-Category</option>
                             {getFilteredSubcatagories().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} className="w-full p-2 border rounded">
                            {genders.map(g => <option key={g} value={g === 'All' ? '' : g}>{g}</option>)}
                        </select>
                         <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-2 border rounded">
                            {types.map(t => <option key={t} value={t === 'All' ? '' : t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Attributes */}
                     <div className="space-y-3">
                        <select value={metalFilter} onChange={e => setMetalFilter(e.target.value)} className="w-full p-2 border rounded">
                            {metals.map(m => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
                        </select>
                         <select value={stoneFilter} onChange={e => setStoneFilter(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">Stone (All)</option>
                            <option value="with">With Stone</option>
                            <option value="without">Without Stone</option>
                        </select>
                        <select value={designFilter} onChange={e => setDesignFilter(e.target.value)} className="w-full p-2 border rounded">
                             <option value="">Design (All)</option>
                             <option value="our">In House</option>
                             <option value="Others">Others</option>
                        </select>
                    </div>

                    {/* Weight & ID */}
                    <div className="space-y-3">
                         <div className="bg-gray-50 p-2 rounded border border-gray-200">
                             <h4 className="font-bold text-xs text-gray-700 mb-1">Weight Range</h4>
                             <div className="max-h-24 overflow-y-auto">
                                {[ '0-2', '2-4', '4-6', '6-8', '8-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-75', '75-+' ].map(r => (
                                    <label key={r} className="flex items-center gap-2 text-xs p-1">
                                        <input type="checkbox" value={r} checked={weightRanges.includes(r)} onChange={e => {
                                             const val = e.target.value;
                                             setWeightRanges(prev => e.target.checked ? [...prev, val] : prev.filter(v => v !== val));
                                        }} />
                                        {r}g
                                    </label>
                                ))}
                             </div>
                         </div>
                         <input type="text" placeholder="Search ID" value={searchId} onChange={e => setSearchId(e.target.value)} className="w-full p-2 border rounded text-sm" />
                    </div>

                 </div>
                 <button onClick={clearAllFilters} className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded font-bold hover:bg-gray-300">Clear All Filters</button>
              </div>
          )}

          {/* 4️⃣ SORT PANEL (FINAL: REMOVED POPULARITY/ORDER) */}
          {showSortPanel && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-300 shadow-xl rounded-b-xl p-4 z-[80]">
                  <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Sort By</h4>
                  <div className="space-y-2">
                      <button onClick={() => { setSortByDate('newest'); setSortField(''); setSortOrder(''); }} className={`w-full text-left p-2 rounded ${sortByDate === 'newest' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-gray-50'}`}>
                          Date: Newest First
                      </button>
                      <button onClick={() => { setSortByDate('oldest'); setSortField(''); setSortOrder(''); }} className={`w-full text-left p-2 rounded ${sortByDate === 'oldest' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-gray-50'}`}>
                          Date: Oldest First
                      </button>
                      <div className="border-t my-2"></div>
                      <button onClick={() => { setSortField('weight'); setSortOrder('desc'); setSortByDate(''); }} className={`w-full text-left p-2 rounded ${sortField === 'weight' && sortOrder === 'desc' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-gray-50'}`}>
                          Weight: High to Low
                      </button>
                      <button onClick={() => { setSortField('weight'); setSortOrder('asc'); setSortByDate(''); }} className={`w-full text-left p-2 rounded ${sortField === 'weight' && sortOrder === 'asc' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-gray-50'}`}>
                          Weight: Low to High
                      </button>
                  </div>
              </div>
          )}

        </div>
      </div>

      {/* CLICK OVERLAY */}
      {(showFilterPanel || showSortPanel) && <div className="fixed inset-0 z-[70]" onClick={() => { setShowFilterPanel(false); setShowSortPanel(false); }} />}

      {/* MAIN CONTENT */}
      <div className="pt-64 pb-10 px-2 sm:px-4 max-w-[1600px] mx-auto">
         
         {/* INFO BAR */}
         <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-sm text-gray-600 font-semibold">
                {totalItems} Items Found
            </span>
            <span className="text-xs bg-white px-2 py-1 rounded border shadow-sm">
                {getActiveSortDescription()}
            </span>
         </div>

         {/* GRID DISPLAY */}
         {loading ? (
             <div className="flex justify-center py-20 text-gray-500">Loading...</div>
         ) : jewellery.length === 0 ? (
             <div className="text-center py-20">
                 <div className="text-4xl mb-2">💎</div>
                 <h3 className="text-lg font-bold text-gray-700">No items found</h3>
                 <button onClick={clearAllFilters} className="mt-2 text-blue-600 underline">Clear Filters</button>
             </div>
         ) : (
             <div className={`grid gap-3 sm:gap-4 ${getGridClasses()}`}>
                 {jewellery.map((item, index) => {
                     const mainImg = getMainImage(item);
                     return (
                         <div 
                            key={item._id} 
                            onClick={() => handleItemClick(item, index)}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-100 group"
                         >
                            <div className={`relative w-full overflow-hidden ${getImageHeightClasses()} bg-gray-100`}>
                                {mainImg ? (
                                    <img 
                                        src={mainImg} 
                                        alt={item.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                                {/* ID Badge */}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                    {item.id}
                                </div>
                            </div>
                            
                            <div className="p-2 sm:p-3">
                                <h3 
                                    style={{ color: COLORS.brandText }}
                                    className="font-bold text-sm sm:text-base truncate mb-1"
                                >
                                    {item.name}
                                </h3>
                                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                                    <span className="font-semibold">{item.weight}g</span>
                                    <span className="bg-amber-100 text-amber-800 px-1 rounded">{item.category?.main}</span>
                                </div>
                            </div>
                         </div>
                     );
                 })}
             </div>
         )}

         {/* PAGINATION */}
         {jewellery.length > 0 && totalPages > 1 && (
             <div className="flex justify-center items-center gap-4 mt-8">
                 <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ backgroundColor: currentPage === 1 ? '#ccc' : COLORS.primaryBtn }}
                    className="text-white px-4 py-2 rounded font-bold disabled:cursor-not-allowed"
                 >
                    Prev
                 </button>
                 <span className="font-semibold text-gray-700">Page {currentPage} of {totalPages}</span>
                 <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ backgroundColor: currentPage === totalPages ? '#ccc' : COLORS.primaryBtn }}
                    className="text-white px-4 py-2 rounded font-bold disabled:cursor-not-allowed"
                 >
                    Next
                 </button>
             </div>
         )}
      </div>

      {/* 6️⃣ MODAL (DETAIL VIEW) */}
      {selectedItem && (
        <div 
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-2 backdrop-blur-sm"
            onTouchStart={onTouchStartHandler}
            onTouchMove={onTouchMoveHandler}
            onTouchEnd={onTouchEndHandler}
        >
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Modal Header */}
                <div style={{ backgroundColor: COLORS.headerBg }} className="p-3 flex justify-between items-center border-b border-yellow-400">
                     <div className="flex gap-2">
                         <button onClick={() => navigateToItem('prev')} className="p-1 hover:bg-black/10 rounded">←</button>
                         <button onClick={() => navigateToItem('next')} className="p-1 hover:bg-black/10 rounded">→</button>
                     </div>
                     <h2 style={{ color: COLORS.brandText }} className="font-bold truncate max-w-[200px] sm:max-w-md">{selectedItem.name}</h2>
                     <button onClick={() => setSelectedItem(null)} className="text-2xl leading-none px-2">&times;</button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Media Section */}
                    <div className="lg:w-3/5 bg-black flex items-center justify-center relative p-4">
                        {(() => {
                            const media = getItemMedia(selectedItem);
                            const current = media[0];
                            return current ? (
                                <img 
                                    src={current.src} 
                                    alt="Detail" 
                                    className="max-h-full max-w-full object-contain cursor-pointer"
                                    onClick={() => { setModalMedia(media); setCurrentMediaIndex(0); }}
                                />
                            ) : <div className="text-white">No Media</div>;
                        })()}
                        {/* Hint */}
                        <div className="absolute bottom-2 text-white/50 text-xs">Swipe or Key nav enabled</div>
                    </div>

                    {/* Details Section */}
                    <div className="lg:w-2/5 p-4 sm:p-6 overflow-y-auto bg-gray-50">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="col-span-2 bg-white p-3 rounded border">
                                <span className="text-gray-500 text-xs block">Item Name</span>
                                <span className="font-bold text-lg text-gray-800">{selectedItem.name}</span>
                            </div>
                            <div className="bg-white p-2 rounded border">
                                <span className="text-gray-500 text-xs block">Weight</span>
                                <span className="font-bold text-gray-800">{selectedItem.weight}g</span>
                            </div>
                            <div className="bg-white p-2 rounded border">
                                <span className="text-gray-500 text-xs block">ID</span>
                                <span className="font-bold text-gray-800">{selectedItem.id}</span>
                            </div>
                            {selectedItem.metal && (
                                <div className="bg-white p-2 rounded border">
                                    <span className="text-gray-500 text-xs block">Metal</span>
                                    <span className="font-bold text-gray-800 capitalize">{selectedItem.metal}</span>
                                </div>
                            )}
                            <div className="bg-white p-2 rounded border">
                                <span className="text-gray-500 text-xs block">Category</span>
                                <span className="font-bold text-gray-800">{selectedItem.category?.main}</span>
                            </div>
                        </div>

                        {/* 3️⃣ WHATSAPP SHARE BUTTON */}
                        <div className="mt-8">
                            <button
                                onClick={handleWhatsAppShare}
                                className="w-full py-3 rounded-lg font-bold text-white shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#25D366' }} // Official WhatsApp Color
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                </svg>
                                Share on WhatsApp
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-2">Sends image link + details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
      
      {/* Full Screen Gallery (If clicked on image in modal) */}
      {modalMedia.length > 0 && (
         <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
             <button onClick={() => setModalMedia([])} className="absolute top-4 right-4 text-white text-4xl">&times;</button>
             <img src={modalMedia[currentMediaIndex].src} className="max-w-full max-h-screen" alt="Full" />
         </div>
      )}

    </div>
  );
}

export default UserCatalogue;