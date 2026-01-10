import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// --- Load Google Font ---
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

function UserCatalogue() {
  // --- Palette Constants ---
  const colors = {
    bg: '#fff8e6',       // Cream Background
    headerText: '#2e2e2e', // Dark Charcoal (Header)
    text: '#4a4a4a',     // Soft Grey (Body)
    primary: '#7f1a2b',  // Royal Burgundy
    accent: '#fae382',   // Pale Gold
    highlight: '#ffcc00', // Bright Gold
    white: '#ffffff'
  };

  // --- Data State ---
  const [jewellery, setJewellery] = useState([]);
  
  // --- Filter States ---
  const [weightRange, setWeightRange] = useState([0, 200]); 
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [stoneFilter, setStoneFilter] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');

  // --- Sort States ---
  const [sortField, setSortField] = useState('date'); 
  const [sortOrder, setSortOrder] = useState('desc');

  // --- Pagination & UI States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);

  // --- Media & Modal States ---
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  // --- Responsive States ---
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(2); // Default mobile friendly
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- Constants ---
  const categories = [
    'All Jewellery', 'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra',
    'Chains', 'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles',
    'Bracelets', 'Antique', 'Custom',
  ];
  const genders = ['All', 'Unisex', 'Women', 'Men'];
  const types = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];

  // --- Device Detection ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        if (gridCols > 2) setGridCols(2); // Force max 2 on mobile
      } else {
        if (gridCols < 2) setGridCols(4); // Default 4 on desktop
      }
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  // --- Grid Logic ---
  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) return prev === 1 ? 2 : 1; // Toggle 1 <-> 2
      // Desktop: 2 -> 3 -> 4 -> 6 -> 2
      return prev === 2 ? 3 : prev === 3 ? 4 : prev === 4 ? 6 : 2;
    });
  };

  const getGridClasses = () => {
    if (isMobile) return gridCols === 1 ? 'grid-cols-1' : 'grid-cols-2';
    return `grid-cols-2 lg:grid-cols-${gridCols}`;
  };

  const getImageHeightClasses = () => {
    if (isMobile) return gridCols === 1 ? 'h-80' : 'h-40';
    switch (gridCols) {
      case 2: return 'h-80';
      case 3: return 'h-64';
      case 4: return 'h-56';
      case 6: return 'h-40';
      default: return 'h-56';
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

      // Sorting
      if (sortField === 'date') {
        params.append('sortByDate', sortOrder === 'desc' ? 'newest' : 'oldest');
      } else {
        params.append('sortField', sortField);
        params.append('sortOrder', sortOrder);
      }

      // Filters
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('catagories', selectedCategory.join(','));
      }
      if (selectedSubCategory?.trim()) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType);
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender);
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter);
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter);
      if (searchQuery?.trim()) params.append('search', searchQuery.trim());
      if (searchId?.trim()) params.append('searchId', searchId.trim());

      // Weight Slider
      params.append('minWeight', weightRange[0].toString());
      params.append('maxWeight', weightRange[1].toString());

      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      let items = [];
      let total = 0;
      let pages = 1;

      if (data) {
        if (Array.isArray(data)) {
          items = data;
          total = data.length;
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
    currentPage, itemsPerPage, sortField, sortOrder,
    selectedCategory, selectedSubCategory, selectedType, selectedGender,
    metalFilter, stoneFilter, designFilter, weightRange, searchQuery, searchId
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory, selectedSubCategory, selectedType, selectedGender, 
    metalFilter, stoneFilter, designFilter, weightRange, searchQuery, searchId, 
    sortField, sortOrder
  ]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // --- Handlers ---
  const handleItemClick = (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedSubCategory('');
    setSelectedType('');
    setSelectedGender('');
    setStoneFilter('');
    setMetalFilter('');
    setDesignFilter('');
    setWeightRange([0, 200]);
    setSearchQuery('');
    setSearchId('');
    setCurrentPage(1);
  };

  const getActiveSortDescription = () => {
    if (sortField === 'date' && sortOrder === 'desc') return 'Newest Arrivals';
    if (sortField === 'date' && sortOrder === 'asc') return 'Oldest Items';
    if (sortField === 'weight' && sortOrder === 'asc') return 'Weight: Low to High';
    if (sortField === 'weight' && sortOrder === 'desc') return 'Weight: High to Low';
    return 'Default';
  };

  // --- Slider Logic ---
  const handleWeightChange = (e, index) => {
    const value = Math.min(Math.max(parseInt(e.target.value), 0), 200);
    setWeightRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      if (index === 0 && value > newRange[1]) newRange[0] = newRange[1];
      if (index === 1 && value < newRange[0]) newRange[1] = newRange[0];
      return newRange;
    });
  };

  // --- Media Helpers ---
  const getItemImages = (item) => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length) return item.images.filter(Boolean);
    if (item.image) return [item.image];
    return [];
  };
  const getMainImage = (item) => getItemImages(item)[0] || null;

  const navigateToItem = (direction) => {
    let newIndex = direction === 'next' ? selectedItemIndex + 1 : selectedItemIndex - 1;
    if (newIndex >= jewellery.length) newIndex = 0;
    if (newIndex < 0) newIndex = jewellery.length - 1;
    setSelectedItem(jewellery[newIndex]);
    setSelectedItemIndex(newIndex);
  };

  // --- Smart WhatsApp Share ---
  const handleShare = async (item) => {
    if (!item) return;
    const mainImg = getMainImage(item);
    
    // 1. Try Native Share (Mobile - Sends Image File)
    if (navigator.share && mainImg) {
      try {
        const response = await fetch(mainImg);
        const blob = await response.blob();
        const file = new File([blob], "jewellery.jpg", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Vimaleshwara Jewellers',
            text: `Check out this ${item.name} (${item.weight}g) from Vimaleshwara Jewellers!\nID: ${item.id}`,
          });
          return; // Exit if successful
        }
      } catch (error) {
        console.log("Native share failed, falling back to URL share", error);
      }
    }

    // 2. Fallback: Text with Image Link (Desktop/Web)
    const text = `*Vimaleshwara Jewellers*\n\n` +
      `💎 *${item.name}*\n` +
      `🆔 ID: ${item.id}\n` +
      `⚖️ Weight: ${item.weight}g\n` +
      `✨ Metal: ${item.metal || 'N/A'}\n\n` +
      `👇 View Image:\n${mainImg}\n\n` +
      `Contact us for more details!`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const getAllSubcategories = () => {
    const base = selectedCategory.length === 0 ? jewellery : jewellery.filter(i => selectedCategory.includes(i.category?.main));
    return [...new Set(base.map(i => i.category?.sub).filter(Boolean))].sort();
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-screen font-sans">
      
      {/* --- CSS for Range Slider & Scrollbar --- */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          -webkit-appearance: none;
          background: ${colors.primary};
          border: 2px solid #fff;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -7px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          z-index: 50;
          position: relative;
        }
        input[type=range]::-moz-range-thumb {
          pointer-events: auto;
          width: 18px;
          height: 18px;
          border: 2px solid #fff;
          border-radius: 50%;
          background: ${colors.primary};
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          z-index: 50;
          position: relative;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* --- Header --- */}
      <div className="fixed top-0 left-0 w-full z-[90] backdrop-blur-md shadow-sm transition-all duration-300" 
           style={{ backgroundColor: 'rgba(255, 248, 230, 0.95)', borderBottom: `1px solid ${colors.accent}` }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px]" style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})` }}>
                <img src="logo.png" alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: colors.headerText }}>
                VIMALESHWARA JEWELLERS
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase" style={{ color: colors.primary }}>Premium Jewellery Collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Control Bar --- */}
      <div className="fixed top-[70px] sm:top-[80px] left-0 w-full z-[85] backdrop-blur-sm shadow-md py-4"
           style={{ backgroundColor: 'rgba(255, 248, 230, 0.95)', borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-4">
          
          {/* Search Input with Integrated Grid Button */}
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              placeholder="Search jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-14 py-2.5 border border-gray-200 rounded-full focus:ring-2 transition-all placeholder-gray-400 focus:outline-none"
              style={{ backgroundColor: '#fff', color: colors.text, borderColor: colors.accent, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Grid Toggle Button (Inside Search) */}
            <button 
              onClick={cycleGrid}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Toggle Grid View"
              style={{ color: colors.primary }}
            >
              {isMobile ? (
                 gridCols === 1 
                 ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> // List icon
                 : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" /></svg> // Grid icon
              ) : (
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => { setShowFilterPanel(!showFilterPanel); setShowSortPanel(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm`}
                style={{ 
                  backgroundColor: showFilterPanel ? colors.primary : '#fff', 
                  color: showFilterPanel ? '#fff' : colors.primary,
                  border: `1px solid ${colors.primary}`
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filters
              </button>
              
              {/* --- Filter Panel --- */}
              {showFilterPanel && (
                <div className="absolute top-full mt-3 left-0 sm:right-0 sm:left-auto w-[90vw] sm:w-[400px] bg-white rounded-2xl shadow-2xl p-6 z-50 max-h-[75vh] overflow-y-auto"
                     style={{ borderTop: `4px solid ${colors.primary}` }}>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <h3 className="font-serif text-lg font-bold" style={{ color: colors.primary }}>Refine Selection</h3>
                      <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide">Reset All</button>
                    </div>

                    {/* Weight Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold" style={{ color: colors.text }}>Weight Range</label>
                        <span className="text-sm font-bold" style={{ color: colors.primary }}>{weightRange[0]}g — {weightRange[1]}g</span>
                      </div>
                      <div className="relative h-8 flex items-center">
                        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
                        <div className="absolute h-1.5 rounded-full" style={{ background: colors.primary, left: `${(weightRange[0]/200)*100}%`, right: `${100-(weightRange[1]/200)*100}%` }}></div>
                        <input type="range" min="0" max="200" value={weightRange[0]} onChange={(e) => handleWeightChange(e, 0)} className="absolute w-full h-1.5 opacity-0 z-20 cursor-pointer" />
                        <input type="range" min="0" max="200" value={weightRange[1]} onChange={(e) => handleWeightChange(e, 1)} className="absolute w-full h-1.5 opacity-0 z-20 cursor-pointer" />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: colors.text }}>Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter(c => c !== 'All Jewellery').map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                              if (selectedCategory.includes(cat)) setSelectedSubCategory('');
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all border`}
                            style={{
                              backgroundColor: selectedCategory.includes(cat) ? colors.primary : '#fff',
                              color: selectedCategory.includes(cat) ? '#fff' : colors.text,
                              borderColor: selectedCategory.includes(cat) ? colors.primary : '#ddd'
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select Dropdowns */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {l:'Metal',v:metalFilter,f:setMetalFilter,o:metals},
                        {l:'Sub Category',v:selectedSubCategory,f:setSelectedSubCategory,o:['All',...getAllSubcategories()]},
                        {l:'Gender',v:selectedGender,f:setSelectedGender,o:genders},
                        {l:'Type',v:selectedType,f:setSelectedType,o:types},
                        {l:'Stone',v:stoneFilter,f:setStoneFilter,o:['All', 'with', 'without']},
                        {l:'Design',v:designFilter,f:setDesignFilter,o:['All','our','Others']}
                      ].map((item,i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#999' }}>{item.l}</label>
                          <select value={item.v} onChange={(e) => item.f(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors">
                             {item.o.map(opt => <option key={opt} value={opt==='All'?'':opt}>
                               {opt === 'our' ? 'In House' : opt === 'Others' ? 'Others' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                             </option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    
                    {/* Search ID */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#999' }}>Search by ID</label>
                        <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-amber-500 focus:bg-white" placeholder="Enter Item ID"/>
                    </div>
                    
                    <button onClick={() => setShowFilterPanel(false)} className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: colors.primary }}>
                        View Results
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="relative">
              <button
                onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm`}
                style={{ 
                  backgroundColor: showSortPanel ? colors.primary : '#fff', 
                  color: showSortPanel ? '#fff' : colors.primary,
                  border: `1px solid ${colors.primary}`
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                Sort
              </button>

              {/* --- Sort Panel --- */}
              {showSortPanel && (
                <div className="absolute top-full mt-3 right-0 w-64 bg-white rounded-2xl shadow-xl p-2 z-50 border border-gray-100">
                  <div className="flex flex-col">
                    {[
                      { l: 'Newest Arrivals', f: 'date', o: 'desc' },
                      { l: 'Oldest Items', f: 'date', o: 'asc' },
                      { l: 'Weight: Low to High', f: 'weight', o: 'asc' },
                      { l: 'Weight: High to Low', f: 'weight', o: 'desc' }
                    ].map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => { setSortField(opt.f); setSortOrder(opt.o); setShowSortPanel(false); }}
                        className={`text-left px-4 py-3 text-sm rounded-lg hover:bg-orange-50 transition-colors ${sortField === opt.f && sortOrder === opt.o ? 'font-bold' : ''}`}
                        style={{ color: sortField === opt.f && sortOrder === opt.o ? colors.primary : colors.text }}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Overlay --- */}
      {(showFilterPanel || showSortPanel) && <div className="fixed inset-0 z-[40]" onClick={() => { setShowFilterPanel(false); setShowSortPanel(false); }} />}

      {/* --- Main Grid Content --- */}
      <div className="pt-40 sm:pt-48 pb-10 max-w-[1400px] mx-auto">
        
        {/* Results Info */}
        {isDataFetched && (
          <div className="px-4 mb-4 flex justify-between items-end">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold font-serif" style={{ color: colors.headerText }}>
                {selectedCategory.length > 0 ? selectedCategory.join(', ') : 'All Collection'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{totalItems} items found</p>
            </div>
            <div className="text-xs font-bold text-gray-400 hidden sm:block uppercase tracking-wider">
              Sorted by: <span style={{ color: colors.primary }}>{getActiveSortDescription()}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-gray-200 rounded-full" style={{ borderTopColor: colors.primary }}></div>
          </div>
        )}

        {/* Product Grid */}
        <div className={`grid gap-3 sm:gap-6 px-4 ${getGridClasses()}`}>
          {!loading && jewellery.map((item, index) => {
            const mainImg = getMainImage(item);
            const mediaCount = getItemImages(item).length;
            
            return (
              <div
                key={item._id}
                onClick={() => handleItemClick(item, index)}
                className="group bg-white rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-transparent hover:border-amber-200 shadow-sm"
              >
                {/* Image Container */}
                <div className={`relative bg-gray-100 overflow-hidden ${getImageHeightClasses()}`}>
                  {mainImg ? (
                    <img
                      src={mainImg}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Image</div>
                  )}
                  
                  {/* Media Badge */}
                  <div className="absolute top-2 left-2 flex gap-1">
                     {mediaCount > 1 && (
                       <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         {mediaCount}
                       </span>
                     )}
                  </div>
                  
                  {/* Design Badge */}
                  <div className="absolute bottom-2 left-2">
                     <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider uppercase shadow-sm`}
                           style={{ 
                             backgroundColor: item.isOurDesign === false ? '#fff' : colors.primary,
                             color: item.isOurDesign === false ? colors.headerText : '#fff'
                           }}>
                       {item.isOurDesign === false ? 'Partner' : 'In House'}
                     </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <h3 className="text-sm font-bold truncate mb-1" style={{ color: colors.headerText }}>{item.name}</h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-serif font-bold text-lg" style={{ color: colors.primary }}>{item.weight}g</span>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{item.category?.main}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination (Simplified) */}
        {isDataFetched && totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 text-gray-700">Previous</button>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">{currentPage} / {totalPages}</span>
            <button onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 text-gray-700">Next</button>
          </div>
        )}
      </div>

      {/* --- Details Modal --- */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl relative">
            
            {/* Close Mobile */}
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 sm:hidden bg-black/30 p-2 rounded-full text-white backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left: Image Viewer */}
            <div className="w-full sm:w-3/5 bg-gray-100 flex flex-col relative h-[50vh] sm:h-[80vh]">
               {/* Nav Arrows Desktop */}
               <button onClick={() => navigateToItem('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition hidden sm:block shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
               <button onClick={() => navigateToItem('next')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition hidden sm:block shadow-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>

              <div className="flex-1 flex items-center justify-center p-6 bg-white">
                <img 
                  src={getMainImage(selectedItem)} 
                  className="max-w-full max-h-full object-contain drop-shadow-xl" 
                  alt={selectedItem.name} 
                  onClick={() => setModalMedia(getItemImages(selectedItem).map(src => ({ type: 'image', src })))}
                />
              </div>

              {/* Thumbnails */}
              {getItemImages(selectedItem).length > 1 && (
                <div className="h-20 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-2 overflow-x-auto px-4 scrollbar-hide">
                  {getItemImages(selectedItem).slice(0,5).map((img, i) => (
                    <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover cursor-pointer border-2 hover:border-amber-500 transition-colors border-transparent" alt="thumb" />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full sm:w-2/5 flex flex-col h-[50vh] sm:h-[80vh] bg-white">
              
              <div className="p-6 border-b border-gray-100 flex justify-between items-start" style={{ backgroundColor: colors.bg }}>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif" style={{ color: colors.headerText }}>{selectedItem.name}</h2>
                  <p className="font-bold mt-1 text-sm" style={{ color: colors.primary }}>ID: {selectedItem.id}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="hidden sm:block text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="col-span-2 p-4 rounded-xl border flex items-center justify-between shadow-sm" style={{ backgroundColor: '#fff', borderColor: colors.accent }}>
                    <span className="font-bold text-sm" style={{ color: colors.primary }}>Gross Weight</span>
                    <span className="text-2xl font-serif font-bold" style={{ color: colors.headerText }}>{selectedItem.weight}g</span>
                  </div>

                  {[
                    { l: 'Category', v: selectedItem.category?.main },
                    { l: 'Sub-Category', v: selectedItem.category?.sub },
                    { l: 'Type', v: selectedItem.type, c: true },
                    { l: 'Gender', v: selectedItem.gender, c: true },
                    { l: 'Metal', v: selectedItem.metal, c: true },
                    { l: 'Stone', v: selectedItem.stoneWeight ? `${selectedItem.stoneWeight}g` : 'None' },
                    { l: 'Design', v: selectedItem.isOurDesign === false ? 'Others Design' : 'In House' },
                  ].map((s, i) => s.v ? (
                    <div key={i}>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#999' }}>{s.l}</span>
                      <div className={`text-sm font-semibold mt-1 ${s.c ? 'capitalize' : ''}`} style={{ color: colors.headerText }}>{s.v}</div>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Share Button */}
              <div className="p-6 border-t border-gray-100 bg-white">
                <button 
                  onClick={() => handleShare(selectedItem)}
                  className="w-full py-3.5 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Full Screen Gallery --- */}
      {modalMedia.length > 0 && (
        <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center">
          <button onClick={() => setModalMedia([])} className="absolute top-4 right-4 text-white z-20 bg-white/10 p-2 rounded-full hover:bg-white/20 backdrop-blur-md"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          
          <div className="w-full h-full flex items-center justify-center">
             <img src={modalMedia[currentMediaIndex]?.src} className="max-w-full max-h-full object-contain" alt="Gallery" />
          </div>
          
          {modalMedia.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              <button onClick={() => setCurrentMediaIndex(prev => (prev - 1 + modalMedia.length) % modalMedia.length)} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 backdrop-blur-md transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <button onClick={() => setCurrentMediaIndex(prev => (prev + 1) % modalMedia.length)} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/30 backdrop-blur-md transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default UserCatalogue;