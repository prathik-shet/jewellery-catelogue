import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// --- STYLE INJECTION ---
// Injecting fonts and animations globally
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700;900&family=Lato:wght@300;400;700&display=swap');
  
  .font-playfair { font-family: 'Playfair Display', serif; }
  .font-lato { font-family: 'Lato', sans-serif; }
  
  /* Custom Scrollbar for Filters/Modal */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4b060; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7f1a2b; }

  /* Shimmer Animation for Skeleton */
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
    background-size: 1000px 100%;
  }
`;
document.head.appendChild(styleTag);

function UserCatalogue() {
  // --- STATE: DATA ---
  const [jewellery, setJewellery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // --- STATE: SORTING ---
  // Default: Newest first
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortByDate, setSortByDate] = useState('newest'); 
  const [sortField, setSortField] = useState('');   

  // --- STATE: FILTERS ---
  const [stoneFilter, setStoneFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [weightRanges, setWeightRanges] = useState([]); // Multi-select weight
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [designFilter, setDesignFilter] = useState('');

  // --- STATE: PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- STATE: UI & INTERACTION ---
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  
  // --- STATE: MODAL ---
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // --- STATE: TOUCH SWIPE ---
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- CONFIG CONSTANTS ---
  const catagories = [
    'All Jewellery', 'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra', 
    'Chains', 'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles', 
    'Bracelets', 'Antique', 'Custom',
  ];
  const genders = ['All', 'Women', 'Men', 'Unisex'];
  const types = ['All', 'Festival', 'Lightweight', 'Daily Wear', 'Fancy', 'Normal'];
  const metals = ['All', 'Gold', 'Silver', 'Diamond', 'Platinum', 'Rose Gold'];
  const weightBuckets = [
    '0-2', '2-4', '4-6', '6-8', '8-10', '10-15', '15-20', '20-25',
    '25-30', '30-35', '35-40', '40-45', '45-50', '50-75', '75-+'
  ];

  // --- RESPONSIVE GRID HANDLER ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Enforce: Mobile (1 or 2 cols), Desktop (2, 3, 4, 6 cols)
      if (mobile && gridCols > 2) setGridCols(2);
      if (!mobile && gridCols < 2) setGridCols(4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  // --- API DATA FETCHING ---
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    // Optional: Add artificial delay to see skeleton animation
    // await new Promise(r => setTimeout(r, 500)); 

    try {
      const params = new URLSearchParams();
      
      // Pagination
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      
      // Sorting Logic (Strictly following requirements)
      if (sortByDate === 'newest') {
        params.append('sortByDate', 'newest');
      } else if (sortByDate === 'oldest') {
        params.append('sortByDate', 'oldest');
      } else if (sortField === 'weight') {
        params.append('sortField', 'weight');
        params.append('sortOrder', sortOrder); // 'asc' or 'desc'
      } else {
        // Fallback default
        params.append('sortByDate', 'newest'); 
      }

      // Filter Logic
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('catagories', selectedCategory.join(','));
      }
      if (selectedSubCategory?.trim()) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType.toLowerCase());
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender.toLowerCase());
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter.toLowerCase());
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter);
      if (weightRanges.length > 0) params.append('weightRanges', weightRanges.join(','));
      if (searchQuery?.trim()) params.append('search', searchQuery.trim());
      if (searchId?.trim()) params.append('searchId', searchId.trim());

      // Fetch
      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      // Normalize Response
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
      console.error('Data Fetch Error:', error);
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

  // Initial Fetch & Update
  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // Reset to Page 1 on Filter Change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightRanges, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  // --- KEYBOARD & MODAL NAVIGATION ---
  useEffect(() => {
    const handleKeys = (e) => {
      if (!selectedItem) return;
      if (e.key === 'ArrowLeft') navigateToItem('prev');
      if (e.key === 'ArrowRight') navigateToItem('next');
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [selectedItem, selectedItemIndex, jewellery]);

  // --- HELPERS: ACTIONS ---
  const handleItemClick = async (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
    try {
        const token = localStorage.getItem('token');
        if(token) await axios.patch(`/api/jewellery/${item._id}/click`, {}, { headers: { Authorization: `Bearer ${token}` }});
    } catch(e) {}
  };

  const navigateToItem = (dir) => {
    let newIdx = dir === 'next' ? selectedItemIndex + 1 : selectedItemIndex - 1;
    if (newIdx >= jewellery.length) newIdx = 0;
    if (newIdx < 0) newIdx = jewellery.length - 1;
    if (jewellery[newIdx]) handleItemClick(jewellery[newIdx], newIdx);
  };

  const shareOnWhatsApp = (item) => {
    if (!item) return;
    const img = getMainImage(item) || '';
    const text = `*Enquiry for Vimaleshwara Jewellers*\n\n` + 
                 `Name: ${item.name}\nID: ${item.orderNo || item._id}\nWeight: ${item.weight}g\n` + 
                 `Link: ${img}`; 
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const clearAllFilters = () => {
    setSelectedCategory([]); setSelectedSubCategory(''); setSelectedType('');
    setSelectedGender(''); setStoneFilter(''); setMetalFilter('');
    setWeightRanges([]); setSearchQuery(''); setSearchId(''); setDesignFilter('');
    setCurrentPage(1);
  };

  // --- HELPERS: UI LOGIC ---
  const cycleGrid = () => {
    setGridCols(prev => isMobile ? (prev === 1 ? 2 : 1) : (prev === 2 ? 3 : prev === 3 ? 4 : prev === 4 ? 6 : 2));
  };

  const getMainImage = (item) => {
    if (item?.images?.length > 0) return item.images[0];
    if (item?.image) return item.image;
    return null;
  };

  const getItemMedia = (item) => {
    if (!item) return [];
    const media = [];
    if (item.images && item.images.length) item.images.forEach(src => media.push({type:'image', src}));
    else if (item.image) media.push({type:'image', src: item.image});
    if (item.videos && item.videos.length) item.videos.forEach(src => media.push({type:'video', src}));
    return media;
  };

  const getPaginationRange = () => {
    const range = [];
    const max = 5;
    if (totalPages <= max) return Array.from({length: totalPages}, (_, i) => i + 1);
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const getSortLabel = () => {
    if (sortByDate === 'newest') return 'Newest First';
    if (sortByDate === 'oldest') return 'Oldest First';
    if (sortField === 'weight') return sortOrder === 'asc' ? 'Weight: Low → High' : 'Weight: High → Low';
    return 'Default';
  };

  // --- TOUCH HANDLERS ---
  const onTouchStartHandler = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMoveHandler = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) navigateToItem('next');
    if (distance < -50) navigateToItem('prev');
  };

  // --- SUB-COMPONENTS ---
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="w-full aspect-[4/5] animate-shimmer"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fff8e6] font-lato text-[#2e2e2e]">
      
      {/* 1. HEADER (Fixed, Z-50) */}
      <header className="fixed top-0 left-0 w-full h-20 z-50 bg-[#7f1a2b] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-[#fae382] shadow-inner">
               <span className="text-[#7f1a2b] font-playfair font-black text-2xl">V</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-playfair font-bold text-xl sm:text-2xl tracking-wide leading-none">
                VIMALESHWARA
              </h1>
              <span className="text-[#fae382] text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1">
                Jewellers
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTROL BAR (Sticky, Z-40) */}
      <div className="fixed top-20 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-[#fae382]/30 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-20 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#7f1a2b] focus:ring-1 focus:ring-[#7f1a2b] outline-none transition-all shadow-sm"
              />
              <button
                onClick={cycleGrid}
                className="absolute right-1 top-1 bottom-1 px-3 bg-gray-100 hover:bg-gray-200 text-[#2e2e2e] rounded-lg text-xs font-bold flex items-center gap-1 border border-gray-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span className="hidden sm:inline">{gridCols}</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowFilterPanel(!showFilterPanel); setShowSortPanel(false); }}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                  showFilterPanel ? 'bg-[#7f1a2b] text-white' : 'bg-white text-[#2e2e2e] border border-gray-200 hover:border-[#7f1a2b]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filter
                {(selectedCategory.length > 0 || weightRanges.length > 0 || metalFilter) && <span className="w-2 h-2 rounded-full bg-[#fae382] animate-pulse"></span>}
              </button>

              <button
                onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                  showSortPanel ? 'bg-[#7f1a2b] text-white' : 'bg-white text-[#2e2e2e] border border-gray-200 hover:border-[#7f1a2b]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                Sort
              </button>
            </div>
          </div>

          {/* --- DROP PANELS --- */}
          
          {/* FILTER PANEL */}
          {showFilterPanel && (
            <div className="absolute top-[110%] left-0 sm:left-4 w-full sm:w-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                  
                  {/* ID Search */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search by ID</h4>
                    <input type="text" value={searchId} onChange={e=>setSearchId(e.target.value)} placeholder="e.g. 1045" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#7f1a2b] outline-none" />
                  </div>

                  {/* Categories (Directly Visible) */}
                  <div>
                    <h4 className="text-xs font-bold text-[#7f1a2b] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Categories</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {catagories.filter(c => c !== 'All Jewellery').map(cat => (
                           <label key={cat} className="flex items-center gap-2 p-1.5 hover:bg-[#fff8e6] rounded cursor-pointer transition-colors">
                             <input 
                               type="checkbox" 
                               checked={selectedCategory.includes(cat)} 
                               onChange={(e) => setSelectedCategory(prev => e.target.checked ? [...prev, cat] : prev.filter(c => c !== cat))}
                               className="accent-[#7f1a2b] w-4 h-4" 
                             />
                             <span className="text-sm text-gray-700">{cat}</span>
                           </label>
                        ))}
                    </div>
                  </div>

                  {/* Weight Ranges (Multi-Select) */}
                  <div>
                    <h4 className="text-xs font-bold text-[#7f1a2b] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Weight Range (grams)</h4>
                    <div className="flex flex-wrap gap-2">
                        {weightBuckets.map(range => (
                           <button 
                             key={range}
                             onClick={() => setWeightRanges(prev => prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range])}
                             className={`px-3 py-1 text-xs border rounded-full transition-all ${weightRanges.includes(range) ? 'bg-[#7f1a2b] text-white border-[#7f1a2b]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#7f1a2b]'}`}
                           >
                             {range.replace('-', '–')}g
                           </button>
                        ))}
                    </div>
                  </div>

                  {/* Dropdowns Grid */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Metal</label>
                        <select value={metalFilter} onChange={e=>setMetalFilter(e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-[#7f1a2b]">{metals.map(m=><option key={m} value={m==='All'?'':m}>{m}</option>)}</select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <select value={selectedType} onChange={e=>setSelectedType(e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-[#7f1a2b]">{types.map(t=><option key={t} value={t==='All'?'':t}>{t}</option>)}</select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Gender</label>
                        <select value={selectedGender} onChange={e=>setSelectedGender(e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-[#7f1a2b]">{genders.map(g=><option key={g} value={g==='All'?'':g}>{g}</option>)}</select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Design</label>
                        <select value={designFilter} onChange={e=>setDesignFilter(e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-[#7f1a2b]"><option value="">All</option><option value="In House">In House</option><option value="Others">Others</option></select>
                      </div>
                  </div>
               </div>
               <div className="pt-4 mt-4 border-t border-gray-100">
                  <button onClick={clearAllFilters} className="w-full py-3 bg-[#2e2e2e] text-white rounded-xl font-bold hover:bg-black transition-colors">Clear All Filters</button>
               </div>
            </div>
          )}

          {/* SORT PANEL (Restricted Options) */}
          {showSortPanel && (
            <div className="absolute top-[110%] left-0 sm:left-[300px] w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex flex-col">
                  <button onClick={() => { setSortByDate('newest'); setSortField(''); }} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${sortByDate==='newest' ? 'bg-[#fff8e6] text-[#7f1a2b]' : 'hover:bg-gray-50 text-gray-600'}`}>Date: Newest First</button>
                  <button onClick={() => { setSortByDate('oldest'); setSortField(''); }} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${sortByDate==='oldest' ? 'bg-[#fff8e6] text-[#7f1a2b]' : 'hover:bg-gray-50 text-gray-600'}`}>Date: Oldest First</button>
                  <button onClick={() => { setSortField('weight'); setSortOrder('asc'); setSortByDate(''); }} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${sortField==='weight' && sortOrder==='asc' ? 'bg-[#fff8e6] text-[#7f1a2b]' : 'hover:bg-gray-50 text-gray-600'}`}>Weight: Low to High</button>
                  <button onClick={() => { setSortField('weight'); setSortOrder('desc'); setSortByDate(''); }} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${sortField==='weight' && sortOrder==='desc' ? 'bg-[#fff8e6] text-[#7f1a2b]' : 'hover:bg-gray-50 text-gray-600'}`}>Weight: High to Low</button>
               </div>
            </div>
          )}

          {/* Overlay */}
          {(showFilterPanel || showSortPanel) && <div className="fixed inset-0 top-[140px] z-30 bg-black/5" onClick={() => { setShowFilterPanel(false); setShowSortPanel(false); }}></div>}
        </div>
      </div>

      {/* 3. MAIN GRID CONTENT */}
      <main className="pt-44 pb-20 max-w-7xl mx-auto min-h-screen px-4">
        
        {/* Results Header */}
        {!loading && (
          <div className="flex justify-between items-end mb-6 border-b border-[#fae382]/30 pb-2">
             <div>
                <span className="text-3xl font-playfair font-bold text-[#7f1a2b]">{totalItems}</span>
                <span className="ml-2 text-sm text-gray-500 font-bold uppercase tracking-wider">Items</span>
             </div>
             <div className="text-xs font-bold text-[#7f1a2b] bg-[#fff8e6] px-3 py-1 rounded-full border border-[#fae382]">
                {getSortLabel()}
             </div>
          </div>
        )}

        {/* Grid System */}
        <div className={`grid gap-4 sm:gap-6 ${
            gridCols === 1 ? 'grid-cols-1' : 
            gridCols === 2 ? 'grid-cols-2' : 
            gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 
            gridCols === 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 
            'grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
        }`}>
            
            {/* Loading Skeletons */}
            {loading && Array.from({length: 8}).map((_, i) => <SkeletonCard key={i} />)}

            {/* Items */}
            {!loading && jewellery.map((item, index) => {
                const mainImg = getMainImage(item);
                return (
                  <div 
                    key={item._id} 
                    onClick={() => handleItemClick(item, index)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#fae382]/50 relative"
                  >
                    <div className={`w-full ${isMobile && gridCols === 1 ? 'aspect-[16/10]' : 'aspect-[4/5]'} bg-gray-50 relative overflow-hidden`}>
                       {mainImg ? (
                         <img src={mainImg} alt={item.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                       <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded backdrop-blur-md shadow-sm ${item.isOurDesign === false ? 'bg-gray-600/90' : 'bg-[#7f1a2b]/90'}`}>
                             {item.isOurDesign === false ? 'Ext' : 'In-House'}
                          </span>
                       </div>
                    </div>

                    <div className="p-4">
                       <div className="flex justify-between items-start mb-1">
                          <h3 className="font-playfair font-bold text-lg text-[#2e2e2e] truncate w-3/4 group-hover:text-[#7f1a2b] transition-colors">{item.name}</h3>
                          <span className="font-bold text-[#7f1a2b] bg-[#fff8e6] px-2 py-0.5 rounded text-sm">{item.weight}g</span>
                       </div>
                       <div className="flex justify-between text-xs text-gray-500 mt-2 font-bold">
                          <span className="uppercase tracking-wide">{item.category?.main}</span>
                          <span>#{item.orderNo || item._id.slice(-4)}</span>
                       </div>
                    </div>
                  </div>
                );
            })}
        </div>

        {/* Empty State */}
        {!loading && jewellery.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">💎</div>
             <h3 className="font-playfair font-bold text-2xl text-[#2e2e2e] mb-2">No Designs Found</h3>
             <p className="text-gray-500 mb-6 max-w-sm mx-auto">Try clearing your filters or search terms.</p>
             <button onClick={clearAllFilters} className="px-8 py-3 bg-[#7f1a2b] text-white rounded-xl font-bold shadow-lg hover:bg-[#5e1320] transition-all">Reset Filters</button>
          </div>
        )}

        {/* 4. PAGINATION */}
        {!loading && totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={() => { if(currentPage > 1) { setCurrentPage(currentPage-1); window.scrollTo(0,0); }}} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="flex gap-1 px-2 hidden sm:flex">
                       {getPaginationRange().map(p => (
                         <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo(0,0); }} className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${p === currentPage ? 'bg-[#7f1a2b] text-white shadow-md scale-105' : 'text-gray-600 hover:bg-[#fff8e6] hover:text-[#7f1a2b]'}`}>{p}</button>
                       ))}
                    </div>
                    {/* Mobile Page Display */}
                    <div className="sm:hidden font-bold text-gray-600">Page {currentPage} of {totalPages}</div>

                    <button onClick={() => { if(currentPage < totalPages) { setCurrentPage(currentPage+1); window.scrollTo(0,0); }}} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-500">
                   <span>Jump to</span>
                   <input type="number" min="1" max={totalPages} placeholder={currentPage}
                     onChange={(e) => { const p = parseInt(e.target.value); if(p >= 1 && p <= totalPages) { setCurrentPage(p); window.scrollTo(0,0); } }}
                     className="w-16 p-2 text-center bg-white border border-gray-200 rounded-lg focus:border-[#7f1a2b] outline-none font-bold text-[#2e2e2e]" 
                   />
                </div>
            </div>
        )}
      </main>

      {/* 5. MODAL OVERLAY (Z-100) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedItem(null)}></div>
            
            {/* Modal Card */}
            <div className="relative bg-white w-full h-full sm:w-[95%] sm:h-[90%] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-300">
                
                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur text-white p-2 rounded-full sm:hidden">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Left: Gallery */}
                <div className="w-full sm:w-[55%] bg-[#0a0a0a] flex flex-col relative group" onTouchStart={onTouchStartHandler} onTouchMove={onTouchMoveHandler} onTouchEnd={onTouchEndHandler}>
                    <div className="flex-1 flex items-center justify-center p-6 relative">
                        {getMainImage(selectedItem) ? (
                            <img src={getMainImage(selectedItem)} alt="Detail" className="max-w-full max-h-[40vh] sm:max-h-[75vh] object-contain drop-shadow-2xl" />
                        ) : (
                             <div className="text-white/30">No Image Available</div>
                        )}
                    </div>
                    {/* Desktop Nav Arrows */}
                    <button onClick={(e) => { e.stopPropagation(); navigateToItem('prev'); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hidden sm:block">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigateToItem('next'); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hidden sm:block">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Right: Info */}
                <div className="w-full sm:w-[45%] bg-white flex flex-col h-full overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-[#fffcf5]">
                        <div>
                           <h2 className="font-playfair font-black text-3xl sm:text-4xl text-[#2e2e2e] leading-tight mb-2">{selectedItem.name}</h2>
                           <div className="flex items-center gap-3">
                              <span className="bg-[#7f1a2b] text-white text-xs font-bold px-3 py-1 rounded-full">ID: {selectedItem.orderNo || selectedItem._id.slice(-6)}</span>
                              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{selectedItem.category?.main}</span>
                           </div>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#2e2e2e]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <h3 className="font-playfair font-bold text-xl text-[#2e2e2e] mb-6">Specifications</h3>
                        <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
                             <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gross Weight</p>
                                <p className="text-3xl font-playfair font-bold text-[#7f1a2b]">{selectedItem.weight}<span className="text-lg text-gray-500 ml-1">g</span></p>
                             </div>
                             {selectedItem.stoneWeight && (
                               <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stone Weight</p>
                                  <p className="text-3xl font-playfair font-bold text-gray-600">{selectedItem.stoneWeight}<span className="text-lg text-gray-400 ml-1">g</span></p>
                               </div>
                             )}
                             <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Metal</p>
                                <p className="text-lg font-bold text-[#2e2e2e] capitalize">{selectedItem.metal}</p>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</p>
                                <p className="text-lg font-bold text-[#2e2e2e] capitalize">{selectedItem.type}</p>
                             </div>
                             <div className="col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Additional Details</p>
                                <ul className="space-y-1 text-sm text-gray-600 font-medium">
                                   <li className="flex justify-between"><span>Category</span> <span>{selectedItem.category?.sub || selectedItem.category?.main}</span></li>
                                   <li className="flex justify-between"><span>Design Origin</span> <span>{selectedItem.isOurDesign === false ? 'External Catalogue' : 'Vimaleshwara Exclusive'}</span></li>
                                   {selectedItem.carat && <li className="flex justify-between"><span>Purity</span> <span>{selectedItem.carat}</span></li>}
                                </ul>
                             </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-10">
                        <button onClick={() => shareOnWhatsApp(selectedItem)} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-200 flex items-center justify-center gap-3 transition-all active:scale-95">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                           Share Enquiry on WhatsApp
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