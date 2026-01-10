import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

// --- Load Playfair Display Font ---
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

function UserCatalogue() {
  // --- Palette Constants ---
  const colors = {
    bg: '#fff8e6',       // Cream
    headerText: '#2e2e2e', // Dark Charcoal
    text: '#4a4a4a',     // Soft Grey
    primary: '#7f1a2b',  // Burgundy
    accent: '#fae382',   // Pale Gold
    highlight: '#ffcc00', // Bright Gold
    white: '#ffffff'
  };

  // --- Data & Filter States ---
  const [jewellery, setJewellery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Filters
  const [weightRange, setWeightRange] = useState([0, 200]); // [min, max]
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [stoneFilter, setStoneFilter] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');

  // Sort
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Detail Modal
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  
  // Media Modal
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Responsive Grid
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(2); // Mobile Default
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- Constants ---
  const categories = ['All Jewellery', 'Earrings', 'Pendants', 'Finger Rings', 'Mangalsutra', 'Chains', 'Nose Pin', 'Necklaces', 'Necklace Set', 'Bangles', 'Bracelets', 'Antique', 'Custom'];
  const genders = ['All', 'Unisex', 'Women', 'Men'];
  const types = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];

  // --- Device Detection ---
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Enforce Grid Constraints
      if (mobile && gridCols > 2) setGridCols(2); 
      if (!mobile && gridCols < 2) setGridCols(4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  // --- Grid Logic ---
  const cycleGrid = () => {
    setGridCols(prev => {
      // Mobile: 1 -> 2 -> 1
      if (isMobile) return prev === 1 ? 2 : 1;
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
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) params.append('catagories', selectedCategory.join(','));
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

      // Data Normalization
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

  // --- DUAL SLIDER LOGIC ---
  const handleWeightChange = (e, index) => {
    const value = Math.min(Math.max(parseInt(e.target.value), 0), 200);
    setWeightRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      // Prevent crossover
      if (index === 0 && value > newRange[1]) newRange[0] = newRange[1];
      if (index === 1 && value < newRange[0]) newRange[1] = newRange[0];
      return newRange;
    });
  };

  // --- Media Logic ---
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

  // --- WhatsApp Share ---
  const handleShare = async (item) => {
    if (!item) return;
    const mainImg = getMainImage(item);
    
    // 1. Mobile Native Share (Tries to send image file)
    if (navigator.share && mainImg && isMobile) {
      try {
        const response = await fetch(mainImg);
        const blob = await response.blob();
        const file = new File([blob], "jewellery.jpg", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Vimaleshwara Jewellers',
            text: `${item.name} (${item.weight}g) - ID: ${item.id}`,
          });
          return;
        }
      } catch (error) {
        console.log("Native share failed, falling back to URL");
      }
    }

    // 2. Fallback / Desktop (Sends Text + Image URL)
    const text = `*Vimaleshwara Jewellers*\n\n` +
      `💎 *${item.name}*\n` +
      `🆔 ID: ${item.id}\n` +
      `⚖️ Weight: ${item.weight}g\n` +
      `✨ Metal: ${item.metal || 'N/A'}\n\n` +
      `👇 View Image:\n${mainImg}\n\n` +
      `Contact us for details!`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  // --- Helper for Subcategories ---
  const getAllSubcategories = () => {
    const base = selectedCategory.length === 0 ? jewellery : jewellery.filter(i => selectedCategory.includes(i.category?.main));
    return [...new Set(base.map(i => i.category?.sub).filter(Boolean))].sort();
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="min-h-screen font-sans selection:bg-burgundy selection:text-white">
      
      {/* --- Slider CSS Injection --- */}
      <style>{`
        .range-slider { position: relative; height: 24px; }
        .range-slider input[type=range] {
          position: absolute; left: 0; bottom: 0; width: 100%;
          -webkit-appearance: none; pointer-events: none; background: transparent; z-index: 20;
        }
        .range-slider input[type=range]::-webkit-slider-thumb {
          pointer-events: auto; width: 20px; height: 20px; border-radius: 50%;
          background: ${colors.primary}; border: 2px solid ${colors.bg};
          cursor: pointer; -webkit-appearance: none; margin-top: -8px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .range-slider input[type=range]::-moz-range-thumb {
          pointer-events: auto; width: 20px; height: 20px; border-radius: 50%;
          background: ${colors.primary}; border: 2px solid ${colors.bg};
          cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .range-track {
          position: absolute; width: 100%; height: 4px; background: #e5e7eb; border-radius: 4px; top: 50%; transform: translateY(-50%); z-index: 10;
        }
        .range-fill {
          position: absolute; height: 4px; background: ${colors.primary}; border-radius: 4px; top: 50%; transform: translateY(-50%); z-index: 11;
        }
      `}</style>

      {/* --- Header --- */}
      <div className="fixed top-0 left-0 w-full z-[90] backdrop-blur-md shadow-sm transition-all duration-300" 
           style={{ backgroundColor: 'rgba(255, 248, 230, 0.95)', borderBottom: `1px solid ${colors.accent}` }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="relative group">
            <div className="w-12 h-12 rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})` }}>
              <img src="logo.png" alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: colors.headerText }}>
              VIMALESHWARA JEWELLERS
            </h1>
            <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase" style={{ color: colors.primary }}>Premium Collection</p>
          </div>
        </div>
      </div>

      {/* --- Control Bar --- */}
      <div className="fixed top-[72px] left-0 w-full z-[85] backdrop-blur-md shadow-md py-4"
           style={{ backgroundColor: 'rgba(255, 248, 230, 0.98)', borderBottom: '1px solid #e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-4">
          
          {/* Search + Grid Toggle */}
          <div className="relative w-full sm:flex-1 group">
            <input
              type="text"
              placeholder="Search jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-14 py-3 rounded-xl border border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{ backgroundColor: '#fff', color: colors.text, borderColor: colors.accent, '--tw-ring-color': colors.primary }}
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Grid Toggle Button (Inside Search) */}
            <button 
              onClick={cycleGrid}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Toggle Grid View"
              style={{ color: colors.primary }}
            >
              {isMobile ? (
                 gridCols === 1 
                 ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> 
                 : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" /></svg>
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
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95`}
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
                <div className="absolute top-full mt-3 left-0 sm:right-0 sm:left-auto w-[92vw] sm:w-[420px] bg-white rounded-2xl shadow-2xl p-6 z-50 max-h-[80vh] overflow-y-auto"
                     style={{ borderTop: `4px solid ${colors.primary}` }}>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <h3 className="font-serif text-xl font-bold" style={{ color: colors.headerText }}>Refine Selection</h3>
                      <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide">Reset All</button>
                    </div>

                    {/* Dual Range Slider (Weight) */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-600">Weight Range</label>
                        <span className="text-sm font-bold" style={{ color: colors.primary }}>{weightRange[0]}g — {weightRange[1]}g</span>
                      </div>
                      <div className="range-slider">
                        <div className="range-track"></div>
                        <div className="range-fill" style={{ left: `${(weightRange[0]/200)*100}%`, right: `${100-(weightRange[1]/200)*100}%` }}></div>
                        <input type="range" min="0" max="200" value={weightRange[0]} onChange={(e) => handleWeightChange(e, 0)} />
                        <input type="range" min="0" max="200" value={weightRange[1]} onChange={(e) => handleWeightChange(e, 1)} />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter(c => c !== 'All Jewellery').map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                              if (selectedCategory.includes(cat)) setSelectedSubCategory('');
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all border font-medium`}
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

                    {/* Filter Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {l:'Metal',v:metalFilter,f:setMetalFilter,o:metals},
                        {l:'Sub Category',v:selectedSubCategory,f:setSelectedSubCategory,o:['All',...getAllSubcategories()]},
                        {l:'Gender',v:selectedGender,f:setSelectedGender,o:genders},
                        {l:'Type',v:selectedType,f:setSelectedType,o:types},
                        {l:'Stone',v:stoneFilter,f:setStoneFilter,o:['All', 'with', 'without']},
                        {l:'Design',v:designFilter,f:setDesignFilter,o:['All','our','Others']}
                      ].map((item,i) => (
                        <div key={i} className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.l}</label>
                          <select value={item.v} onChange={(e) => item.f(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors">
                             {item.o.map(opt => <option key={opt} value={opt==='All'?'':opt}>
                               {opt === 'our' ? 'In House' : opt === 'Others' ? 'Others' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                             </option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    
                    {/* Search ID */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Search by ID</label>
                        <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-amber-500 focus:bg-white" placeholder="Enter Item ID"/>
                    </div>
                    
                    <button onClick={() => setShowFilterPanel(false)} className="w-full py-3.5 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg" style={{ backgroundColor: colors.primary }}>
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
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95`}
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
                <div className="absolute top-full mt-3 right-0 w-64 bg-white rounded-2xl shadow-xl p-3 z-50 border border-gray-100">
                  <div className="flex flex-col gap-1">
                    {[
                      { l: 'Newest Arrivals', f: 'date', o: 'desc' },
                      { l: 'Oldest Items', f: 'date', o: 'asc' },
                      { l: 'Weight: Low to High', f: 'weight', o: 'asc' },
                      { l: 'Weight: High to Low', f: 'weight', o: 'desc' }
                    ].map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => { setSortField(opt.f); setSortOrder(opt.o); setShowSortPanel(false); }}
                        className={`text-left px-4 py-3 text-sm rounded-lg hover:bg-orange-50 transition-colors ${sortField === opt.f && sortOrder === opt.o ? 'font-bold bg-orange-50' : ''}`}
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

      {/* --- Main Content --- */}
      <div className="pt-44 sm:pt-48 pb-10 max-w-[1400px] mx-auto min-h-screen">
        
        {/* Info Bar */}
        {isDataFetched && (
          <div className="px-4 mb-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif" style={{ color: colors.headerText }}>
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
            <div className="animate-spin w-12 h-12 border-4 border-gray-200 rounded-full" style={{ borderTopColor: colors.primary }}></div>
          </div>
        )}

        {/* Product Grid */}
        <div className={`grid gap-3 sm:gap-6 px-4 ${getGridClasses()}`}>
          {!loading && jewellery.map((item, index) => {
            const mainImg = getMainImage(item);
            
            return (
              <div
                key={item._id}
                onClick={() => handleItemClick(item, index)}
                className="group bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-amber-200 shadow-md"
              >
                {/* Image Container */}
                <div className={`relative bg-gray-100 overflow-hidden ${getImageHeightClasses()}`}>
                  {mainImg ? (
                    <img
                      src={mainImg}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Image</div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                     {getItemImages(item).length > 1 && (
                       <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         {getItemImages(item).length}
                       </span>
                     )}
                  </div>
                  
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
                <div className="p-4">
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

        {/* Pagination */}
        {isDataFetched && totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2 pb-10">
            <button onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 text-gray-700">Previous</button>
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">{currentPage} / {totalPages}</span>
            <button onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 text-gray-700">Next</button>
          </div>
        )}
      </div>

      {/* --- Details Modal --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl relative">
            
            {/* Close Mobile */}
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 sm:hidden bg-black/30 p-2 rounded-full text-white backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left: Image Viewer */}
            <div className="w-full sm:w-3/5 bg-gray-100 flex flex-col relative h-[50vh] sm:h-[80vh]">
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
                <div className="h-20 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-2 overflow-x-auto px-4">
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
                  className="w-full py-4 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
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
          <button onClick={() => setModalMedia([])} className="absolute top-4 right-4 text-white z-20 bg-white/10 p-2 rounded-full hover:bg-white/20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          
          <div className="w-full h-full flex items-center justify-center">
             <img src={modalMedia[currentMediaIndex]?.src} className="max-w-full max-h-full object-contain" alt="Gallery" />
          </div>
          
          {modalMedia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <button onClick={() => setCurrentMediaIndex(prev => (prev - 1 + modalMedia.length) % modalMedia.length)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <button onClick={() => setCurrentMediaIndex(prev => (prev + 1) % modalMedia.length)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default UserCatalogue;