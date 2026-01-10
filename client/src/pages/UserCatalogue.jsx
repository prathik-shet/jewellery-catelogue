import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function UserCatalogue() {
  const [jewellery, setJewellery] = useState([]);
  
  // --- Sorting State ---
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortField, setSortField] = useState('clickCount'); // Default sort
  const [sortByDate, setSortByDate] = useState(''); // 'newest' or 'oldest'

  // --- Filter State ---
  const [stoneFilter, setStoneFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  
  // REPLACED: Weight Ranges array with Min/Max inputs
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [designFilter, setDesignFilter] = useState('');
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  // --- UI States ---
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4); 
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  
  // --- Touch States ---
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const catagories = [
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

  // --- Grid & UI Helpers ---
  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) {
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        return 1;
      } else {
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        if (prev === 4) return 6;
        return 2;
      }
    });
  };

  const getGridClasses = () => {
    if (isMobile) {
      switch (gridCols) {
        case 1: return 'grid grid-cols-1';
        case 2: return 'grid grid-cols-2';
        case 3: return 'grid grid-cols-2 sm:grid-cols-3';
        default: return 'grid grid-cols-2';
      }
    } else {
      switch (gridCols) {
        case 2: return 'grid grid-cols-2 lg:grid-cols-2';
        case 3: return 'grid grid-cols-2 lg:grid-cols-3';
        case 4: return 'grid grid-cols-2 lg:grid-cols-4';
        case 6: return 'grid grid-cols-3 lg:grid-cols-6';
        default: return 'grid grid-cols-2 lg:grid-cols-4';
      }
    }
  };

  const getImageHeightClasses = () => {
     if (isMobile) {
      switch (gridCols) {
        case 1: return 'h-80';
        case 2: return 'h-40';
        case 3: return 'h-32';
        default: return 'h-40';
      }
    } else {
      switch (gridCols) {
        case 2: return 'h-56 lg:h-80';
        case 3: return 'h-48 lg:h-64';
        case 4: return 'h-40 lg:h-48';
        case 6: return 'h-32 lg:h-40';
        default: return 'h-40 lg:h-48';
      }
    }
  };

  const getTextSizeClasses = () => {
    if (isMobile) {
      return gridCols === 1 
        ? { title: 'text-lg sm:text-xl', details: 'text-sm' }
        : { title: 'text-xs sm:text-sm', details: 'text-[10px]' };
    }
    return { title: 'text-sm lg:text-base', details: 'text-xs lg:text-sm' };
  };

  // --- Helper Functions for Media ---
  const getItemImages = (item) => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length > 0) return item.images.filter(Boolean);
    if (item.image) return [item.image];
    return [];
  };

  const getItemVideos = (item) => {
    if (!item) return [];
    if (Array.isArray(item.videos) && item.videos.length > 0) return item.videos.filter(Boolean);
    return [];
  };

  const getMainImage = (item) => {
    const images = getItemImages(item);
    return images.length > 0 ? images[0] : null;
  };

  const getItemMedia = (item) => {
    if (!item) return [];
    const media = [];
    getItemImages(item).forEach((img) => media.push({ type: 'image', src: img }));
    getItemVideos(item).forEach((vid) => media.push({ type: 'video', src: vid }));
    return media;
  };

  // --- Data Fetching ---
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    setIsDataFetched(false);
    try {
      const params = new URLSearchParams();
      
      // Pagination
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      
      // --- FIXED SORTING LOGIC ---
      if (sortByDate === 'newest') {
        params.append('sortField', 'date'); // backend expects 'date' or 'createdAt'
        params.append('sortOrder', 'desc');
      } else if (sortByDate === 'oldest') {
        params.append('sortField', 'date');
        params.append('sortOrder', 'asc');
      } else {
        // Fallback to standard field sort (Weight, Popularity, etc)
        params.append('sortField', sortField || 'clickCount');
        params.append('sortOrder', sortOrder || 'desc');
      }

      // --- FILTERS ---
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('catagories', selectedCategory.join(','));
      }
      if (selectedSubCategory && selectedSubCategory.trim() !== '') params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== '' && selectedType !== 'All') params.append('type', selectedType);
      if (selectedGender && selectedGender !== '' && selectedGender !== 'All') params.append('gender', selectedGender);
      if (metalFilter && metalFilter !== '' && metalFilter !== 'All') params.append('metal', metalFilter);
      if (stoneFilter && stoneFilter !== '') params.append('stone', stoneFilter);
      if (designFilter && designFilter !== '') params.append('design', designFilter);
      
      // --- FIXED WEIGHT FILTER (Min/Max inputs) ---
      if (minWeight !== '') params.append('minWeight', minWeight);
      if (maxWeight !== '') params.append('maxWeight', maxWeight);
      
      if (searchQuery && searchQuery.trim() !== '') params.append('search', searchQuery.trim());
      if (searchId && searchId.trim() !== '') params.append('searchId', searchId.trim());

      console.log('API URL:', `/api/jewellery?${params.toString()}`);
      
      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      // Handle response variations
      let items = [];
      let total = 0;
      let pages = 1;

      if (data) {
        if (Array.isArray(data)) {
          items = data;
          total = data.length;
          pages = Math.ceil(total / itemsPerPage);
        } else if (data.items || data.data || data.jewellery) {
          items = data.items || data.data || data.jewellery;
          total = data.totalItems || data.total || data.count || items.length;
          pages = data.totalPages || Math.ceil(total / itemsPerPage);
        } else if (data.pagination && data.items) {
           items = data.items;
           total = data.pagination.totalCount;
           pages = data.pagination.totalPages;
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
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsDataFetched(true);
    }
  }, [
    currentPage, itemsPerPage, sortField, sortOrder, sortByDate,
    selectedCategory, selectedSubCategory, selectedType, selectedGender,
    metalFilter, stoneFilter, designFilter, 
    minWeight, maxWeight, // Added these dependencies
    searchQuery, searchId,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, minWeight, maxWeight, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // --- Click / View Handler ---
  const handleItemClick = async (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
    
    try {
      const token = localStorage.getItem('token');
      // Optimistic update
      setJewellery(prev => prev.map(jewel => 
        jewel._id === item._id 
          ? { ...jewel, clickCount: (jewel.clickCount || 0) + 1 }
          : jewel
      ));
      
      // API call
      await axios.patch(`/api/jewellery/${item._id}/click`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to update popularity:', error);
    }
  };

  // --- WhatsApp Share Function (From Old Code) ---
  const handleShare = async (item) => {
    if (!item) return;
    const mainImg = getMainImage(item);
    
    // 1. Mobile Native Share (Tries to send image file + text)
    if (navigator.share && mainImg && isMobile) {
      try {
        const response = await fetch(mainImg);
        const blob = await response.blob();
        const file = new File([blob], "jewellery.jpg", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Vimaleshwara Jewellers',
            text: `${item.name}\nID: ${item.orderNo || item.id}\nWeight: ${item.weight}g\n`,
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
      `🆔 ID: ${item.orderNo || item.id}\n` +
      `⚖️ Weight: ${item.weight}g\n` +
      `✨ Metal: ${item.metal || 'N/A'}\n\n` +
      `👇 View Image:\n${mainImg}\n\n` +
      `Contact us for details!`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  // --- Modal Navigation ---
  const navigateToItem = (direction) => {
    let newIndex = selectedItemIndex;
    
    if (direction === 'next') {
      newIndex = selectedItemIndex + 1;
      if (newIndex >= jewellery.length) newIndex = 0;
    } else if (direction === 'prev') {
      newIndex = selectedItemIndex - 1;
      if (newIndex < 0) newIndex = jewellery.length - 1;
    }
    
    if (newIndex !== selectedItemIndex && jewellery[newIndex]) {
      setSelectedItem(jewellery[newIndex]);
      setSelectedItemIndex(newIndex);
      handleItemClick(jewellery[newIndex], newIndex); // Update view count
    }
  };

  // --- Touch Handling ---
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) navigateToItem('next');
    else if (isRightSwipe) navigateToItem('prev');
  };

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedItem) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigateToItem('prev'); } 
      else if (e.key === 'ArrowRight') { e.preventDefault(); navigateToItem('next'); } 
      else if (e.key === 'Escape') { setSelectedItem(null); setSelectedItemIndex(-1); }
    };
    if (selectedItem) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedItem, selectedItemIndex, jewellery]);

  // --- Pagination Logic ---
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) range.push(i);
    }
    return range;
  };

  // --- Filter Helpers ---
  const getAllcatagories = () => catagories.filter(cat => cat !== 'All Jewellery');
  
  const getFilteredSubcatagories = () => {
    if (selectedCategory.length === 0) {
      const allSub = jewellery.map(item => item.category?.sub).filter(Boolean);
      return [...new Set(allSub)].sort();
    }
    const filteredSub = jewellery
      .filter(item => selectedCategory.includes(item.category?.main))
      .map(item => item.category?.sub)
      .filter(Boolean);
    return [...new Set(filteredSub)].sort();
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedSubCategory('');
    setSelectedType('');
    setSelectedGender('');
    setStoneFilter('');
    setMetalFilter('');
    setMinWeight(''); // Clear min
    setMaxWeight(''); // Clear max
    setSearchQuery('');
    setSearchId('');
    setDesignFilter('');
    setCurrentPage(1);
  };

  const clearAllSorts = () => {
    setSortField('clickCount');
    setSortOrder('desc');
    setSortByDate('');
    setCurrentPage(1);
  };

  const getActiveSortDescription = () => {
    if (sortByDate === 'newest') return 'Date: Newest First';
    if (sortByDate === 'oldest') return 'Date: Oldest First';
    if (sortField === 'weight' && sortOrder === 'asc') return 'Weight: Low to High';
    if (sortField === 'weight' && sortOrder === 'desc') return 'Weight: High to Low';
    if (sortField === 'clickCount' && sortOrder === 'desc') return 'Popularity';
    return 'Default';
  };

  // --- Media Modal Helpers ---
  const openMediaModal = (media, startIndex = 0) => {
    setModalMedia(media);
    setCurrentMediaIndex(startIndex);
  };
  const closeMediaModal = () => {
    setModalMedia([]);
    setCurrentMediaIndex(0);
  };
  const navigateMedia = (direction) => {
    if (direction === 'next') setCurrentMediaIndex(prev => (prev + 1) % modalMedia.length);
    else setCurrentMediaIndex(prev => (prev - 1 + modalMedia.length) % modalMedia.length);
  };

  // --- Icon Helper ---
  const getGridIcon = () => (
     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1"/>
       <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1"/>
       <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1"/>
       <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1"/>
     </svg>
  );

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-orange-400/90 backdrop-blur-md fixed top-0 left-0 w-full z-[90] shadow-2xl p-4 border-b border-amber-300/50">
        <div className="flex items-center gap-4 justify-center sm:justify-start">
          <div className="relative">
            <img src="logo.png" alt="Logo" loading="lazy" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-3 border-white shadow-xl ring-4 ring-amber-200/50" />
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide drop-shadow-lg">VIMALESHWARA JEWELLERS</h1>
            <p className="text-amber-100 text-xs sm:text-sm font-medium">Premium Jewellery Collection</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/95 backdrop-blur-md fixed top-20 sm:top-24 left-0 w-full z-[85] shadow-lg p-4 border-b border-amber-200">
        <div className="w-full max-w-5xl mx-auto">
          {/* Search Row */}
          <div className="relative mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jewellery by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-16 py-3 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/30 transition-all duration-300 text-sm sm:text-base font-medium"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button onClick={cycleGrid} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-1">
                {getGridIcon()}
                <span className="text-xs font-bold hidden sm:inline">{gridCols}</span>
              </button>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-center gap-3">
            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => { setShowFilterPanel(!showFilterPanel); setShowSortPanel(false); }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className="text-sm sm:text-base">Filter</span>
              </button>

              {/* Filter Panel */}
              {showFilterPanel && (
                <div className="absolute top-full mt-2 left-0 w-80 sm:w-96 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                  <div className="space-y-4">
                    {/* Weight Range Input - CHANGED HERE */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Weight Range (grams)</label>
                      <div className="flex items-center gap-2">
                         <div className="flex-1">
                           <input
                             type="number"
                             placeholder="Min"
                             value={minWeight}
                             onChange={(e) => setMinWeight(e.target.value)}
                             className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                           />
                         </div>
                         <span className="text-gray-500 font-bold">-</span>
                         <div className="flex-1">
                           <input
                             type="number"
                             placeholder="Max"
                             value={maxWeight}
                             onChange={(e) => setMaxWeight(e.target.value)}
                             className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                           />
                         </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Categories</label>
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50">
                        {getAllcatagories().map((cat) => (
                          <label key={cat} className="flex items-center gap-2 text-sm p-1 hover:bg-blue-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              value={cat}
                              checked={selectedCategory.includes(cat)}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedCategory((prev) => e.target.checked ? [...prev, value] : prev.filter((v) => v !== value));
                                if (!e.target.checked) setSelectedSubCategory('');
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Other Selects */}
                    {/* SubCat, Type, Gender, Metal, Stone, Design, SearchID */}
                    {[
                       { label: 'Sub-Category', val: selectedSubCategory, set: setSelectedSubCategory, opts: getFilteredSubcatagories(), isMap: true },
                       { label: 'Type', val: selectedType, set: setSelectedType, opts: types },
                       { label: 'Gender', val: selectedGender, set: setSelectedGender, opts: genders },
                       { label: 'Metal', val: metalFilter, set: setMetalFilter, opts: metals },
                       { label: 'Stone', val: stoneFilter, set: setStoneFilter, opts: [{val:'', txt:'All Stones'}, {val:'with', txt:'With Stone'}, {val:'without', txt:'Without Stone'}], isObj: true },
                       { label: 'Design', val: designFilter, set: setDesignFilter, opts: [{val:'', txt:'All Designs'}, {val:'our', txt:'In House'}, {val:'Others', txt:'Others Design'}], isObj: true }
                    ].map((filter, idx) => (
                       <div key={idx}>
                         <label className="block font-bold text-blue-700 mb-2">{filter.label}</label>
                         <select
                           value={filter.val}
                           onChange={(e) => filter.set(e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 capitalize"
                         >
                            {filter.isObj 
                              ? filter.opts.map((o, i) => <option key={i} value={o.val}>{o.txt}</option>)
                              : filter.isMap 
                                ? <><option value="">All {filter.label}</option>{filter.opts.map(o => <option key={o} value={o}>{o}</option>)}</>
                                : filter.opts.map((o, i) => <option key={i} value={o === 'All' ? '' : o}>{o === 'All' ? `All ${filter.label}s` : o}</option>)
                            }
                         </select>
                       </div>
                    ))}
                    
                    {/* ID Search */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Search by ID</label>
                      <input type="text" placeholder="ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                    </div>

                    <button onClick={clearAllFilters} className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2">
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="relative">
              <button
                onClick={() => { setShowSortPanel(!showSortPanel); setShowFilterPanel(false); }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                <span className="text-sm sm:text-base">Sort</span>
              </button>

              {/* Sort Panel */}
              {showSortPanel && (
                <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white border-2 border-purple-300 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200"><p className="text-purple-700 font-bold text-center">{getActiveSortDescription()}</p></div>
                    
                    {/* Simplified Sorting Buttons that match user request */}
                    <div className="space-y-2">
                       <button onClick={() => { setSortByDate('newest'); setSortField(''); setSortOrder(''); }} className={`w-full p-3 rounded-lg border-2 font-semibold ${sortByDate === 'newest' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-purple-50'}`}>Newest First</button>
                       <button onClick={() => { setSortByDate('oldest'); setSortField(''); setSortOrder(''); }} className={`w-full p-3 rounded-lg border-2 font-semibold ${sortByDate === 'oldest' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-purple-50'}`}>Oldest First</button>
                       <button onClick={() => { setSortField('weight'); setSortOrder('asc'); setSortByDate(''); }} className={`w-full p-3 rounded-lg border-2 font-semibold ${sortField === 'weight' && sortOrder === 'asc' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-purple-50'}`}>Weight: Low to High</button>
                       <button onClick={() => { setSortField('weight'); setSortOrder('desc'); setSortByDate(''); }} className={`w-full p-3 rounded-lg border-2 font-semibold ${sortField === 'weight' && sortOrder === 'desc' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-purple-50'}`}>Weight: High to Low</button>
                       <button onClick={() => { setSortField('clickCount'); setSortOrder('desc'); setSortByDate(''); }} className={`w-full p-3 rounded-lg border-2 font-semibold ${sortField === 'clickCount' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-purple-50'}`}>Most Popular</button>
                    </div>

                    <button onClick={clearAllSorts} className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300">Reset Sort</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {(showFilterPanel || showSortPanel) && <div className="fixed inset-0 z-[70]" onClick={() => { setShowFilterPanel(false); setShowSortPanel(false); }} />}

      {/* Main Grid Content */}
      <div className="pt-60 sm:pt-64">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-amber-700">Loading jewellery...</p>
            </div>
          </div>
        )}

        {isDataFetched && totalItems > 0 && (
          <div className="px-4 sm:px-6 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="font-bold text-amber-800">Showing {jewellery.length} of {totalItems} items</span>
              <span className="text-sm bg-amber-100 px-3 py-1 rounded-full text-amber-800">{getActiveSortDescription()}</span>
            </div>
          </div>
        )}

        <div className={`gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-6 pb-8 ${getGridClasses()}`}>
          {!loading && jewellery.length === 0 ? (
            <div className="col-span-full text-center py-20">
               <div className="text-6xl mb-4">💎</div>
               <p className="text-xl font-bold text-gray-600">No items found</p>
               <button onClick={clearAllFilters} className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg">Reset Filters</button>
            </div>
          ) : (
            jewellery.map((item, index) => {
              const mainImage = getMainImage(item);
              const itemImages = getItemImages(item);
              const textSizes = getTextSizeClasses();
              
              return (
                <div key={item._id} onClick={() => handleItemClick(item, index)} className="bg-white border border-amber-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                  {mainImage && (
                    <div className={`relative overflow-hidden ${getImageHeightClasses()}`}>
                      <img src={mainImage} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {itemImages.length > 1 && <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">📷 {itemImages.length}</span>}
                      </div>
                      <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.isOurDesign === false ? 'bg-white text-gray-800' : 'bg-amber-500 text-white'}`}>
                        {item.isOurDesign === false ? 'Partner' : 'In House'}
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <h2 className={`font-bold text-gray-800 truncate ${textSizes.title}`}>{item.name}</h2>
                    <div className={`flex justify-between mt-1 text-gray-600 ${textSizes.details}`}>
                       <span className="font-bold text-amber-600">{item.weight}g</span>
                       <span className="truncate max-w-[50%]">{item.category?.main}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Pagination Controls */}
        {isDataFetched && totalPages > 1 && jewellery.length > 0 && (
          <div className="flex justify-center gap-2 pb-10 px-4">
             <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50">Prev</button>
             <span className="px-4 py-2 bg-amber-100 text-amber-800 font-bold rounded-lg">{currentPage} / {totalPages}</span>
             <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[95] flex items-center justify-center p-0 sm:p-4" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-2xl">
             
             {/* Header Mobile */}
             <div className="sm:hidden p-4 bg-amber-500 text-white flex justify-between items-center">
                <button onClick={() => setSelectedItem(null)}>✕</button>
                <span className="font-bold truncate">{selectedItem.name}</span>
                <span className="text-xs">{selectedItemIndex + 1}/{jewellery.length}</span>
             </div>

             {/* Left: Image */}
             <div className="w-full sm:w-3/5 bg-gray-100 flex flex-col relative h-[50vh] sm:h-[80vh]">
                <div className="flex-1 flex items-center justify-center p-4">
                  <img src={getMainImage(selectedItem)} className="max-w-full max-h-full object-contain cursor-pointer" onClick={() => openMediaModal(getItemMedia(selectedItem), 0)} alt="Main" />
                </div>
                {/* Thumbnails */}
                {getItemImages(selectedItem).length > 1 && (
                  <div className="h-20 bg-white border-t flex items-center justify-center gap-2 overflow-x-auto px-4 py-2">
                    {getItemImages(selectedItem).map((img, i) => (
                      <img key={i} src={img} className="h-full rounded border hover:border-amber-500 cursor-pointer" onClick={() => openMediaModal(getItemMedia(selectedItem), i)} alt="thumb" />
                    ))}
                  </div>
                )}
                {/* Nav Buttons Desktop */}
                <button onClick={() => navigateToItem('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white hidden sm:block shadow-lg">←</button>
                <button onClick={() => navigateToItem('next')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white hidden sm:block shadow-lg">→</button>
             </div>

             {/* Right: Details */}
             <div className="w-full sm:w-2/5 bg-white flex flex-col h-[50vh] sm:h-[80vh]">
                <div className="p-6 border-b hidden sm:flex justify-between items-start">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-800">{selectedItem.name}</h2>
                     <p className="text-amber-600 font-bold">ID: {selectedItem.orderNo || selectedItem.id}</p>
                   </div>
                   <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-red-500 text-2xl">×</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-200 flex justify-between items-center">
                         <span className="text-amber-800 font-bold">Gross Weight</span>
                         <span className="text-2xl font-bold text-amber-600">{selectedItem.weight}g</span>
                      </div>
                      <div className="p-3 border rounded-lg"><span className="text-xs text-gray-500 uppercase block">Category</span><span className="font-semibold capitalize">{selectedItem.category?.main}</span></div>
                      <div className="p-3 border rounded-lg"><span className="text-xs text-gray-500 uppercase block">Sub-Cat</span><span className="font-semibold capitalize">{selectedItem.category?.sub || '-'}</span></div>
                      <div className="p-3 border rounded-lg"><span className="text-xs text-gray-500 uppercase block">Metal</span><span className="font-semibold capitalize">{selectedItem.metal}</span></div>
                      <div className="p-3 border rounded-lg"><span className="text-xs text-gray-500 uppercase block">Gender</span><span className="font-semibold capitalize">{selectedItem.gender}</span></div>
                      <div className="p-3 border rounded-lg"><span className="text-xs text-gray-500 uppercase block">Type</span><span className="font-semibold capitalize">{selectedItem.type}</span></div>
                      <div className="p-3 border rounded-lg"><span className="text-xs text-gray-500 uppercase block">Stone</span><span className="font-semibold capitalize">{selectedItem.stoneWeight ? `${selectedItem.stoneWeight}g` : 'None'}</span></div>
                   </div>
                </div>

                {/* SHARE BUTTON - ADDED HERE */}
                <div className="p-4 border-t bg-gray-50">
                   <button 
                     onClick={() => handleShare(selectedItem)}
                     className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                   >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                     Share on WhatsApp
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Full Screen Media Modal */}
      {modalMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center">
           <button onClick={closeMediaModal} className="absolute top-4 right-4 text-white z-50 bg-white/20 p-2 rounded-full">✕</button>
           <div className="relative w-full h-full flex items-center justify-center">
             {modalMedia[currentMediaIndex].type === 'image' ? (
                <img src={modalMedia[currentMediaIndex].src} className="max-w-full max-h-full object-contain" alt="Gallery" />
             ) : (
                <video src={modalMedia[currentMediaIndex].src} controls autoPlay className="max-w-full max-h-full" />
             )}
           </div>
           {modalMedia.length > 1 && (
             <>
               <button onClick={() => navigateMedia('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-4 rounded-full text-white hover:bg-white/40">←</button>
               <button onClick={() => navigateMedia('next')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-4 rounded-full text-white hover:bg-white/40">→</button>
             </>
           )}
        </div>
      )}
    </div>
  );
}

export default UserCatalogue;