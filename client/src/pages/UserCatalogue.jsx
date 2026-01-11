import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Injecting Google Font for Playfair Display
const fontStyle = document.createElement('style');
fontStyle.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');`;
document.head.appendChild(fontStyle);

function UserCatalogue() {
  // --- STATE MANAGEMENT ---
  const [jewellery, setJewellery] = useState([]);
  
  // Sorting State
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortByDate, setSortByDate] = useState(''); // 'newest' | 'oldest'
  const [sortField, setSortField] = useState('');   // 'weight' | ''
  
  // Filter State
  const [stoneFilter, setStoneFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [weightRanges, setWeightRanges] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [designFilter, setDesignFilter] = useState('');
   
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
   
  // UI State
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
   
  // Modal & Media State
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Swipe Handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- CONSTANTS & CONFIG ---
  const catagories = [
    'All Jewellery', 'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra', 
    'Chains', 'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles', 
    'Bracelets', 'Antique', 'Custom',
  ];
  
  const genders = ['All', 'Women', 'Men', 'Unisex'];
  const types = ['All', 'Festival', 'Lightweight', 'Daily Wear', 'Fancy', 'Normal'];
  const metals = ['All', 'Gold', 'Silver', 'Diamond', 'Platinum', 'Rose Gold'];

  // --- GRID & RESPONSIVE LOGIC ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Enforce layout constraints
      if (mobile && gridCols > 2) setGridCols(2);
      if (!mobile && gridCols < 2) setGridCols(4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) {
        // Mobile: Cycle 1 -> 2 -> 1 (No 3 columns)
        return prev === 1 ? 2 : 1;
      } else {
        // Desktop: 2 -> 3 -> 4 -> 6 -> 2
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        if (prev === 4) return 6;
        return 2;
      }
    });
  };

  const getGridClasses = () => {
    switch (gridCols) {
      case 1: return 'grid grid-cols-1';
      case 2: return 'grid grid-cols-2';
      case 3: return 'grid grid-cols-2 md:grid-cols-3'; // Fallback for tablet
      case 4: return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 6: return 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      default: return 'grid grid-cols-2 lg:grid-cols-4';
    }
  };

  const getImageHeightClasses = () => {
    if (isMobile) return gridCols === 1 ? 'h-80' : 'h-48';
    if (gridCols >= 6) return 'h-40';
    return 'h-64';
  };

  // --- API FETCHING ---
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    setIsDataFetched(false);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      
      // Sorting Logic
      if (sortByDate === 'newest') {
        params.append('sortByDate', 'newest');
      } else if (sortByDate === 'oldest') {
        params.append('sortByDate', 'oldest');
      } else if (sortField === 'weight') {
        params.append('sortField', 'weight');
        params.append('sortOrder', sortOrder);
      } else {
        // Default fallback (though we removed popularity from UI, backend needs a default)
        params.append('sortField', 'createdAt'); 
        params.append('sortOrder', 'desc');
      }

      // Filtering Logic
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('catagories', selectedCategory.join(','));
      }
      if (selectedSubCategory?.trim()) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType.toLowerCase());
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender.toLowerCase());
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter.toLowerCase());
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter); // 'In House' or 'Others' will be handled by backend or logic below
      if (weightRanges.length > 0) params.append('weightRanges', weightRanges.join(','));
      if (searchQuery?.trim()) params.append('search', searchQuery.trim());
      if (searchId?.trim()) params.append('searchId', searchId.trim());

      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      // Handle various response structures
      let items = [];
      let total = 0;
      let pages = 1;

      if (data) {
        if (Array.isArray(data)) {
            items = data; total = data.length;
        } else if (data.items || data.data || data.jewellery) {
            items = data.items || data.data || data.jewellery;
            total = data.totalItems || data.total || data.count || items.length;
            pages = data.totalPages || Math.ceil(total / itemsPerPage);
        }
      }

      setJewellery(items || []);
      setTotalItems(total || 0);
      setTotalPages(pages || 1);

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
    fetchJewellery();
  }, [fetchJewellery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightRanges, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  // --- HELPER FUNCTIONS ---
  const getItemImages = (item) => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length > 0) return item.images.filter(Boolean);
    if (item.image) return [item.image];
    return [];
  };

  const getMainImage = (item) => {
    const images = getItemImages(item);
    return images.length > 0 ? images[0] : null; // Fallback image could go here
  };

  const getItemMedia = (item) => {
    if (!item) return [];
    const media = [];
    getItemImages(item).forEach(img => media.push({ type: 'image', src: img }));
    if(Array.isArray(item.videos)) item.videos.filter(Boolean).forEach(vid => media.push({ type: 'video', src: vid }));
    return media;
  };

  const handleItemClick = async (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
    // Optimistic click count update (API call hidden for brevity)
    try {
        const token = localStorage.getItem('token');
        if(token) await axios.patch(`/api/jewellery/${item._id}/click`, {}, { headers: { Authorization: `Bearer ${token}` }});
    } catch(e) {}
  };

  const shareOnWhatsApp = (item) => {
    if (!item) return;
    const mainImage = getMainImage(item) || '';
    
    // Constructing a message that includes the image link for preview generation
    const text = `*Enquiry for Vimaleshwara Jewellers*\n\n` +
                 `Name: ${item.name}\n` +
                 `ID: ${item._id || item.orderNo}\n` +
                 `Weight: ${item.weight}g\n` +
                 `Link: ${mainImage}`; // Sending the link usually prompts WA to fetch a preview

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- NAVIGATION & SWIPE ---
  const navigateToItem = (direction) => {
    let newIndex = direction === 'next' ? selectedItemIndex + 1 : selectedItemIndex - 1;
    if (newIndex >= jewellery.length) newIndex = 0;
    if (newIndex < 0) newIndex = jewellery.length - 1;
    if (jewellery[newIndex]) handleItemClick(jewellery[newIndex], newIndex);
  };

  const onTouchStartHandler = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMoveHandler = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) navigateToItem('next');
    if (distance < -50) navigateToItem('prev');
  };

  // --- FILTERS HELPERS ---
  const clearAllFilters = () => {
    setSelectedCategory([]); setSelectedSubCategory(''); setSelectedType('');
    setSelectedGender(''); setStoneFilter(''); setMetalFilter('');
    setWeightRanges([]); setSearchQuery(''); setSearchId(''); setDesignFilter('');
    setCurrentPage(1);
  };

  const getActiveSortDescription = () => {
    if (sortByDate === 'newest') return 'Date: Newest';
    if (sortByDate === 'oldest') return 'Date: Oldest';
    if (sortField === 'weight') return sortOrder === 'asc' ? 'Weight: Low to High' : 'Weight: High to Low';
    return 'Default';
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#fff8e6] text-[#2e2e2e] font-[Playfair_Display]">
      
      {/* 1. HEADER */}
      <div className="fixed top-0 left-0 w-full z-[90] shadow-md bg-[#7f1a2b]">
        <div className="flex items-center p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#fae382] overflow-hidden bg-white shadow-lg">
                {/* Placeholder Logo */}
                <div className="w-full h-full flex items-center justify-center text-[#7f1a2b] font-bold text-2xl">V</div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide">
                VIMALESHWARA JEWELLERS
              </h1>
              <p className="text-[#fae382] text-xs sm:text-sm tracking-widest uppercase">Premium Collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR (Sticky below header) */}
      <div className="fixed top-[80px] sm:top-[96px] left-0 w-full z-[85] bg-white/95 backdrop-blur-md shadow-sm border-b border-[#fae382]/30 py-3">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Top Row: Search & Grid Toggle */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search jewellery by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-20 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#7f1a2b] focus:ring-1 focus:ring-[#7f1a2b] shadow-inner text-[#2e2e2e]"
            />
            {/* Grid Toggle INSIDE Search Bar (Right) */}
            <button
              onClick={cycleGrid}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 text-[#2e2e2e] p-2 rounded hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200"
              title="Toggle Grid View"
            >
              {/* Simple Grid Icon */}
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
               <span className="text-xs font-bold hidden sm:inline">{gridCols} Col</span>
            </button>
          </div>

          {/* Bottom Row: Filter & Sort Buttons */}
          <div className="flex gap-3 justify-center">
            {/* Filter Button */}
            <button
              onClick={() => { setShowFilterPanel(!showFilterPanel); setShowSortPanel(false); }}
              className={`px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 ${
                showFilterPanel ? 'bg-[#7f1a2b] text-white' : 'bg-white text-[#7f1a2b] border border-[#7f1a2b]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Filter
            </button>

            {/* Sort Button */}
            <button
              onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
              className={`px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 ${
                showSortPanel ? 'bg-[#7f1a2b] text-white' : 'bg-white text-[#7f1a2b] border border-[#7f1a2b]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
              Sort
            </button>
          </div>

          {/* 3. DROPDOWN PANELS */}
          
          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-96 bg-white border border-[#fae382] rounded-xl shadow-2xl z-[90] max-h-[70vh] overflow-y-auto p-5">
              <div className="space-y-4">
                 {/* ID Search */}
                 <div>
                  <label className="block text-[#7f1a2b] font-bold mb-1">Search by ID</label>
                  <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full p-2 border rounded" placeholder="Enter Item ID" />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-[#7f1a2b] font-bold mb-1">Categories</label>
                  <div className="max-h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                    {catagories.filter(c => c !== 'All Jewellery').map(cat => (
                      <label key={cat} className="flex items-center gap-2 p-1 hover:bg-[#fff8e6] cursor-pointer">
                        <input type="checkbox" checked={selectedCategory.includes(cat)} 
                               onChange={(e) => {
                                 const val = cat;
                                 setSelectedCategory(prev => e.target.checked ? [...prev, val] : prev.filter(v => v !== val));
                               }} 
                               className="accent-[#7f1a2b]" />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dropdowns Grid */}
                <div className="grid grid-cols-2 gap-3">
                   {/* Metal */}
                   <div>
                    <label className="block text-[#7f1a2b] font-bold mb-1 text-sm">Metal</label>
                    <select value={metalFilter} onChange={(e) => setMetalFilter(e.target.value)} className="w-full p-2 border rounded text-sm">
                        {metals.map(m => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
                    </select>
                   </div>
                   {/* Type */}
                   <div>
                    <label className="block text-[#7f1a2b] font-bold mb-1 text-sm">Type</label>
                    <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-2 border rounded text-sm">
                        {types.map(t => <option key={t} value={t === 'All' ? '' : t}>{t}</option>)}
                    </select>
                   </div>
                   {/* Gender */}
                   <div>
                    <label className="block text-[#7f1a2b] font-bold mb-1 text-sm">Gender</label>
                    <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="w-full p-2 border rounded text-sm">
                        {genders.map(g => <option key={g} value={g === 'All' ? '' : g}>{g}</option>)}
                    </select>
                   </div>
                   {/* Design */}
                   <div>
                    <label className="block text-[#7f1a2b] font-bold mb-1 text-sm">Design</label>
                    <select value={designFilter} onChange={(e) => setDesignFilter(e.target.value)} className="w-full p-2 border rounded text-sm">
                        <option value="">All</option>
                        <option value="In House">In House</option>
                        <option value="Others">Others</option>
                    </select>
                   </div>
                   {/* Stone */}
                   <div>
                    <label className="block text-[#7f1a2b] font-bold mb-1 text-sm">Stone</label>
                    <select value={stoneFilter} onChange={(e) => setStoneFilter(e.target.value)} className="w-full p-2 border rounded text-sm">
                        <option value="">All</option>
                        <option value="with">With Stone</option>
                        <option value="without">Without Stone</option>
                    </select>
                   </div>
                </div>

                <button onClick={clearAllFilters} className="w-full py-2 bg-[#2e2e2e] text-white rounded font-bold hover:bg-black">Clear Filters</button>
              </div>
            </div>
          )}

          {/* Sort Panel */}
          {showSortPanel && (
            <div className="absolute top-full right-0 sm:right-auto sm:left-[200px] mt-2 w-72 bg-white border border-[#fae382] rounded-xl shadow-2xl z-[90] p-5">
               <h3 className="font-bold text-[#7f1a2b] mb-3">Sort By</h3>
               <div className="space-y-2">
                 <button onClick={() => { setSortByDate('newest'); setSortField(''); setSortOrder(''); }} className={`w-full text-left p-2 rounded ${sortByDate==='newest' ? 'bg-[#fff8e6] text-[#7f1a2b] font-bold' : 'hover:bg-gray-50'}`}>Date: Newest First</button>
                 <button onClick={() => { setSortByDate('oldest'); setSortField(''); setSortOrder(''); }} className={`w-full text-left p-2 rounded ${sortByDate==='oldest' ? 'bg-[#fff8e6] text-[#7f1a2b] font-bold' : 'hover:bg-gray-50'}`}>Date: Oldest First</button>
                 <button onClick={() => { setSortField('weight'); setSortOrder('desc'); setSortByDate(''); }} className={`w-full text-left p-2 rounded ${sortField==='weight' && sortOrder==='desc' ? 'bg-[#fff8e6] text-[#7f1a2b] font-bold' : 'hover:bg-gray-50'}`}>Weight: High to Low</button>
                 <button onClick={() => { setSortField('weight'); setSortOrder('asc'); setSortByDate(''); }} className={`w-full text-left p-2 rounded ${sortField==='weight' && sortOrder==='asc' ? 'bg-[#fff8e6] text-[#7f1a2b] font-bold' : 'hover:bg-gray-50'}`}>Weight: Low to High</button>
               </div>
            </div>
          )}
          
          {/* Overlay to close panels */}
          {(showFilterPanel || showSortPanel) && <div className="fixed inset-0 z-[80]" onClick={() => { setShowFilterPanel(false); setShowSortPanel(false); }} />}
        </div>
      </div>

      {/* 4. MAIN CONTENT */}
      <div className="pt-[220px] pb-10 max-w-7xl mx-auto min-h-screen">
        
        {/* Active Filters Summary */}
        {isDataFetched && (
          <div className="px-4 mb-4 flex justify-between items-end border-b border-[#fae382] pb-2">
            <div>
               <span className="text-2xl font-bold text-[#7f1a2b]">{totalItems}</span> 
               <span className="text-gray-600 ml-2">Designs Found</span>
            </div>
            <div className="text-sm text-[#7f1a2b] font-medium hidden sm:block">{getActiveSortDescription()}</div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#fae382] border-t-[#7f1a2b] rounded-full animate-spin"></div>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && (
            <div className={`gap-4 px-4 ${getGridClasses()}`}>
              {jewellery.map((item, index) => {
                 const mainImg = getMainImage(item);
                 return (
                   <div key={item._id} onClick={() => handleItemClick(item, index)}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer border border-transparent hover:border-[#fae382] group">
                      
                      {/* Image Container */}
                      <div className={`relative w-full ${getImageHeightClasses()} bg-gray-100`}>
                        {mainImg ? (
                          <img src={mainImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        )}
                        
                        {/* Design Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded shadow-sm ${item.isOurDesign === false ? 'bg-gray-500' : 'bg-[#7f1a2b]'}`}>
                           {item.isOurDesign === false ? 'Others' : 'In House'}
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className="p-3">
                         <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-[#2e2e2e] truncate w-3/4">{item.name}</h3>
                            <span className="font-bold text-[#7f1a2b] text-sm">{item.weight}g</span>
                         </div>
                         <div className="flex justify-between text-xs text-gray-500">
                            <span>{item.category?.main}</span>
                            <span>ID: {item.orderNo || item._id.slice(-4)}</span>
                         </div>
                      </div>
                   </div>
                 );
              })}
            </div>
        )}

        {/* Empty State */}
        {!loading && jewellery.length === 0 && (
            <div className="text-center py-20">
                <p className="text-xl text-gray-500">No jewellery found matching your criteria.</p>
                <button onClick={clearAllFilters} className="mt-4 text-[#7f1a2b] font-bold underline">Reset Filters</button>
            </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
           <div className="flex justify-center gap-2 mt-10 px-4">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="px-4 py-2 bg-white border border-[#fae382] rounded disabled:opacity-50">Prev</button>
              <span className="px-4 py-2 bg-[#7f1a2b] text-white rounded font-bold">{currentPage}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="px-4 py-2 bg-white border border-[#fae382] rounded disabled:opacity-50">Next</button>
           </div>
        )}
      </div>

      {/* 5. DETAILS MODAL (FULL SCREEN) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row relative shadow-2xl">
                
                {/* Close Button Mobile */}
                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 bg-white/50 p-2 rounded-full sm:hidden">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Left: Media Slider */}
                <div className="w-full sm:w-1/2 bg-black flex flex-col relative"
                     onTouchStart={onTouchStartHandler} onTouchMove={onTouchMoveHandler} onTouchEnd={onTouchEndHandler}>
                     
                     {/* Main Image */}
                     <div className="flex-1 flex items-center justify-center p-4">
                        {getMainImage(selectedItem) && (
                            <img src={getMainImage(selectedItem)} alt="Detail" className="max-w-full max-h-[50vh] sm:max-h-[70vh] object-contain" />
                        )}
                     </div>

                     {/* Navigation Arrows (Desktop) */}
                     <button onClick={() => navigateToItem('prev')} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 hidden sm:block">←</button>
                     <button onClick={() => navigateToItem('next')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 hidden sm:block">→</button>
                </div>

                {/* Right: Details & Actions */}
                <div className="w-full sm:w-1/2 bg-[#fff8e6] flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-[#fae382]">
                        <div className="flex justify-between items-start">
                           <h2 className="text-2xl sm:text-3xl font-bold text-[#2e2e2e] font-[Playfair_Display]">{selectedItem.name}</h2>
                           <button onClick={() => setSelectedItem(null)} className="hidden sm:block text-gray-400 hover:text-black">
                               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                        <p className="text-[#7f1a2b] font-medium mt-1">ID: {selectedItem._id}</p>
                    </div>

                    {/* Scrollable Details */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white p-3 rounded border border-[#fae382]/50">
                                 <span className="text-xs text-gray-500 uppercase tracking-wide">Gross Weight</span>
                                 <div className="text-xl font-bold text-[#2e2e2e]">{selectedItem.weight}g</div>
                             </div>
                             {selectedItem.stoneWeight && (
                                <div className="bg-white p-3 rounded border border-[#fae382]/50">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Stone Weight</span>
                                    <div className="text-xl font-bold text-[#2e2e2e]">{selectedItem.stoneWeight}g</div>
                                </div>
                             )}
                             <div className="bg-white p-3 rounded border border-[#fae382]/50">
                                 <span className="text-xs text-gray-500 uppercase tracking-wide">Metal</span>
                                 <div className="text-lg font-medium capitalize">{selectedItem.metal}</div>
                             </div>
                             <div className="bg-white p-3 rounded border border-[#fae382]/50">
                                 <span className="text-xs text-gray-500 uppercase tracking-wide">Type</span>
                                 <div className="text-lg font-medium capitalize">{selectedItem.type}</div>
                             </div>
                         </div>
                         
                         {/* Description/Notes */}
                         <div className="mt-4">
                             <h4 className="font-bold text-[#2e2e2e] mb-2">Item Details</h4>
                             <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                 <li>Category: {selectedItem.category?.main} / {selectedItem.category?.sub}</li>
                                 <li>Design Source: {selectedItem.isOurDesign === false ? 'External' : 'Vimaleshwara In-House'}</li>
                                 {selectedItem.carat && <li>Purity: {selectedItem.carat}</li>}
                             </ul>
                         </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-white border-t border-[#fae382]">
                        <button 
                            onClick={() => shareOnWhatsApp(selectedItem)}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            Share on WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default UserCatalogue;