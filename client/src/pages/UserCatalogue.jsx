import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

function UserCatalogue() {
  // --- Data State ---
  const [jewellery, setJewellery] = useState([]);
  
  // --- Filter States ---
  const [weightRange, setWeightRange] = useState([0, 200]); // Slider State
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
  // Default to Newest
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
  const [gridCols, setGridCols] = useState(4);
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
      if (mobile && gridCols > 3) setGridCols(2);
      else if (!mobile && gridCols < 2) setGridCols(4);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  // --- Grid Logic ---
  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) return prev === 1 ? 2 : prev === 2 ? 3 : 1;
      return prev === 2 ? 3 : prev === 3 ? 4 : prev === 4 ? 6 : 2;
    });
  };

  const getGridClasses = () => {
    if (isMobile) {
      return gridCols === 1 ? 'grid-cols-1' : gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';
    }
    return `grid-cols-2 lg:grid-cols-${gridCols}`;
  };

  const getImageHeightClasses = () => {
    if (isMobile) return 'h-48'; // Standardized mobile height
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

      // New Weight Slider Logic
      params.append('minWeight', weightRange[0].toString());
      params.append('maxWeight', weightRange[1].toString());

      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      // Normalize Response
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

      if (items.length > 0) {
        setJewellery(items);
        setTotalItems(total);
        setTotalPages(pages);
      } else {
        setJewellery([]);
        setTotalItems(0);
        setTotalPages(1);
      }
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

  // Reset page on filter change
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
    // Removed click counting logic as requested
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedSubCategory('');
    setSelectedType('');
    setSelectedGender('');
    setStoneFilter('');
    setMetalFilter('');
    setDesignFilter('');
    setWeightRange([0, 200]); // Reset slider
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

  // --- Slider Component Helper ---
  const handleWeightChange = (e, index) => {
    const value = parseInt(e.target.value);
    setWeightRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      // Prevent crossover
      if (index === 0 && value > newRange[1]) newRange[0] = newRange[1];
      if (index === 1 && value < newRange[0]) newRange[1] = newRange[0];
      return newRange;
    });
  };

  // --- Modal Navigation & Media ---
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

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) navigateToItem('next');
    if (distance < -50) navigateToItem('prev');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedItem) return;
      if (e.key === 'ArrowLeft') navigateToItem('prev');
      if (e.key === 'ArrowRight') navigateToItem('next');
      if (e.key === 'Escape') { setSelectedItem(null); setSelectedItemIndex(-1); }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedItem, selectedItemIndex, jewellery]);

  // --- Helpers for Filter Options ---
  const getAllSubcategories = () => {
    const base = selectedCategory.length === 0 ? jewellery : jewellery.filter(i => selectedCategory.includes(i.category?.main));
    return [...new Set(base.map(i => i.category?.sub).filter(Boolean))].sort();
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* --- Modern Glass Header --- */}
      <div className="fixed top-0 left-0 w-full z-[90] bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-[2px]">
                <img src="logo.png" alt="Logo" className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 tracking-tight">
                VIMALESHWARA
              </h1>
              <p className="text-xs text-amber-600 font-medium tracking-widest uppercase">Fine Jewellery</p>
            </div>
          </div>
          
          {/* Mobile Grid Toggle (Visible only on mobile header) */}
          {isMobile && (
             <button onClick={cycleGrid} className="p-2 text-gray-600 hover:text-amber-600 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
          )}
        </div>
      </div>

      {/* --- Control Bar (Search, Filter, Sort) --- */}
      <div className="fixed top-[70px] sm:top-[80px] left-0 w-full z-[85] bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              placeholder="Search jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-full text-gray-700 focus:bg-white focus:ring-2 focus:ring-amber-500/50 transition-all placeholder-gray-400"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => { setShowFilterPanel(!showFilterPanel); setShowSortPanel(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${showFilterPanel ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-500 hover:text-amber-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filters
              </button>
              
              {/* --- Filter Panel --- */}
              {showFilterPanel && (
                <div className="absolute top-full mt-3 left-0 sm:right-0 sm:left-auto w-[90vw] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 max-h-[75vh] overflow-y-auto">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <h3 className="font-serif text-lg font-bold text-gray-900">Refine Selection</h3>
                      <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide">Reset All</button>
                    </div>

                    {/* Weight Slider Range */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-gray-700">Weight Range</label>
                        <span className="text-sm font-medium text-amber-600">{weightRange[0]}g — {weightRange[1]}g</span>
                      </div>
                      <div className="relative h-12 flex items-center">
                        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-amber-500 absolute"
                             style={{ 
                               left: `${(weightRange[0] / 200) * 100}%`, 
                               right: `${100 - (weightRange[1] / 200) * 100}%` 
                             }}
                           />
                        </div>
                        <input 
                          type="range" min="0" max="200" value={weightRange[0]} 
                          onChange={(e) => handleWeightChange(e, 0)}
                          className="absolute w-full h-1.5 opacity-0 cursor-pointer z-10"
                        />
                        <input 
                          type="range" min="0" max="200" value={weightRange[1]} 
                          onChange={(e) => handleWeightChange(e, 1)}
                          className="absolute w-full h-1.5 opacity-0 cursor-pointer z-10"
                        />
                        {/* Custom Thumbs Visuals (Optional, strictly functionality handled by opacity inputs) */}
                        <div 
                          className="absolute w-5 h-5 bg-white border-2 border-amber-500 rounded-full shadow-md pointer-events-none"
                          style={{ left: `calc(${(weightRange[0] / 200) * 100}% - 10px)` }}
                        />
                        <div 
                          className="absolute w-5 h-5 bg-white border-2 border-amber-500 rounded-full shadow-md pointer-events-none"
                          style={{ left: `calc(${(weightRange[1] / 200) * 100}% - 10px)` }}
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter(c => c !== 'All Jewellery').map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                              if (selectedCategory.includes(cat)) setSelectedSubCategory('');
                            }}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${selectedCategory.includes(cat) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select Dropdowns Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Metal</label>
                        <select value={metalFilter} onChange={(e) => setMetalFilter(e.target.value)} className="w-full p-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500">
                          {metals.map(m => <option key={m} value={m === 'All' ? '' : m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Sub Category</label>
                         <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} className="w-full p-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500">
                          <option value="">All</option>
                          {getAllSubcategories().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                       <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                        <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="w-full p-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500">
                          {genders.map(g => <option key={g} value={g === 'All' ? '' : g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Design</label>
                         <select value={designFilter} onChange={(e) => setDesignFilter(e.target.value)} className="w-full p-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500">
                          <option value="">All</option>
                          <option value="our">In House</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Search ID */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search by ID</label>
                        <input 
                           type="text" 
                           value={searchId}
                           onChange={(e) => setSearchId(e.target.value)}
                           className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-amber-500 outline-none"
                           placeholder="Enter Item ID"
                        />
                    </div>
                    
                    <button onClick={() => setShowFilterPanel(false)} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${showSortPanel ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-500 hover:text-amber-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                Sort
              </button>

              {/* --- Sort Panel --- */}
              {showSortPanel && (
                <div className="absolute top-full mt-3 right-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  <div className="flex flex-col">
                    <button 
                      onClick={() => { setSortField('date'); setSortOrder('desc'); setShowSortPanel(false); }}
                      className={`text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-50 ${sortField === 'date' && sortOrder === 'desc' ? 'text-amber-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                    >
                      Newest Arrivals
                    </button>
                    <button 
                      onClick={() => { setSortField('date'); setSortOrder('asc'); setShowSortPanel(false); }}
                      className={`text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-50 ${sortField === 'date' && sortOrder === 'asc' ? 'text-amber-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                    >
                      Oldest Items
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button 
                      onClick={() => { setSortField('weight'); setSortOrder('asc'); setShowSortPanel(false); }}
                      className={`text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-50 ${sortField === 'weight' && sortOrder === 'asc' ? 'text-amber-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                    >
                      Weight: Low to High
                    </button>
                    <button 
                      onClick={() => { setSortField('weight'); setSortOrder('desc'); setShowSortPanel(false); }}
                      className={`text-left px-4 py-3 text-sm rounded-lg hover:bg-gray-50 ${sortField === 'weight' && sortOrder === 'desc' ? 'text-amber-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                    >
                      Weight: High to Low
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Grid Toggle */}
            {!isMobile && (
              <button 
                onClick={cycleGrid}
                className="hidden sm:flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full hover:border-amber-500 hover:text-amber-600 transition-all text-gray-500"
                title="Change Grid View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Overlay --- */}
      {(showFilterPanel || showSortPanel) && <div className="fixed inset-0 z-[40]" onClick={() => { setShowFilterPanel(false); setShowSortPanel(false); }} />}

      {/* --- Main Grid Content --- */}
      <div className="pt-40 sm:pt-48 pb-10 max-w-[1400px] mx-auto">
        
        {/* Results Info */}
        {isDataFetched && (
          <div className="px-4 mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                {selectedCategory.length > 0 ? selectedCategory.join(', ') : 'All Collection'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{totalItems} items found</p>
            </div>
            <div className="text-xs font-medium text-gray-400 hidden sm:block">
              Sorted by: <span className="text-gray-900">{getActiveSortDescription()}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-gray-200 border-t-amber-600 rounded-full"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && jewellery.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-lg font-bold text-gray-900">No items match your criteria</h3>
            <button onClick={clearAllFilters} className="mt-4 px-6 py-2 text-sm font-medium text-amber-600 border border-amber-600 rounded-full hover:bg-amber-50">
              Clear Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className={`grid gap-4 sm:gap-6 px-4 ${getGridClasses()}`}>
          {!loading && jewellery.map((item, index) => {
            const mainImg = getMainImage(item);
            const mediaCount = getItemImages(item).length;
            
            return (
              <div
                key={item._id}
                onClick={() => handleItemClick(item, index)}
                className="group bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
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
                    <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                     {mediaCount > 1 && (
                       <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         {mediaCount}
                       </span>
                     )}
                  </div>
                  
                  {/* Design Badge (Subtle) */}
                  <div className="absolute bottom-2 left-2">
                     <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider uppercase ${item.isOurDesign === false ? 'bg-white text-gray-900' : 'bg-amber-500 text-white'}`}>
                       {item.isOurDesign === false ? 'Partner' : 'In House'}
                     </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate mb-1">{item.name}</h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-serif text-amber-700 font-semibold">{item.weight}g</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">{item.category?.main}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {isDataFetched && totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900">
                {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Details Modal (Cleaned Up) --- */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl relative">
            
            {/* Close Button Mobile */}
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 z-20 sm:hidden bg-white/20 p-2 rounded-full text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left: Image Viewer */}
            <div className="w-full sm:w-3/5 bg-gray-100 flex flex-col relative h-[50vh] sm:h-[80vh]">
              {/* Desktop Nav Arrows */}
              <button onClick={() => navigateToItem('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition hidden sm:block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <button onClick={() => navigateToItem('next')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition hidden sm:block"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              
              <div className="flex-1 flex items-center justify-center p-6">
                <img 
                  src={getMainImage(selectedItem)} 
                  className="max-w-full max-h-full object-contain drop-shadow-2xl" 
                  alt={selectedItem.name} 
                  onClick={() => setModalMedia(getItemImages(selectedItem).map(src => ({ type: 'image', src })))}
                />
              </div>

              {/* Thumbnails */}
              {getItemImages(selectedItem).length > 1 && (
                <div className="h-20 bg-white/50 backdrop-blur border-t border-white/20 flex items-center justify-center gap-2 overflow-x-auto px-4">
                  {getItemImages(selectedItem).slice(0,5).map((img, i) => (
                    <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover cursor-pointer border border-transparent hover:border-amber-500" alt="thumb" />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details (Modernized & Cleaned) */}
            <div className="w-full sm:w-2/5 flex flex-col h-[50vh] sm:h-[80vh] bg-white">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900">{selectedItem.name}</h2>
                  <p className="text-amber-600 font-medium mt-1">ID: {selectedItem.id}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="hidden sm:block text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Scrollable Specs */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  
                  {/* Primary Spec */}
                  <div className="col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                    <span className="text-amber-800 font-medium">Gross Weight</span>
                    <span className="text-2xl font-bold text-gray-900">{selectedItem.weight}g</span>
                  </div>

                  {/* Other Specs */}
                  {[
                    { label: 'Category', value: selectedItem.category?.main },
                    { label: 'Sub-Category', value: selectedItem.category?.sub },
                    { label: 'Type', value: selectedItem.type, capitalize: true },
                    { label: 'Gender', value: selectedItem.gender, capitalize: true },
                    { label: 'Metal', value: selectedItem.metal, capitalize: true },
                    { label: 'Stone Weight', value: selectedItem.stoneWeight ? `${selectedItem.stoneWeight}g` : null },
                    { label: 'Carat', value: selectedItem.carat },
                    { label: 'Design', value: selectedItem.isOurDesign === false ? 'Others Design' : 'In House' },
                  ].map((spec, i) => (
                    spec.value ? (
                      <div key={i} className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{spec.label}</span>
                        <span className={`text-sm font-semibold text-gray-800 mt-1 ${spec.capitalize ? 'capitalize' : ''}`}>
                          {spec.value}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              {/* Footer / Contact Actions (Optional placeholder) */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2">
                   Enquire Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Full Screen Media Gallery Modal --- */}
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