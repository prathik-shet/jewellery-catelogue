import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function UserCatalogue() {
  const [jewellery, setJewellery] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortByDate, setSortByDate] = useState('');
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  // Enhanced modal media handling
  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Responsive grid system - separate for mobile and desktop
  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4); // Default for desktop
  const [sortField, setSortField] = useState('clickCount');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  
  // Enhanced item selection with navigation
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  
  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const catagories = [
    'All Jewellery',
    'Earrings',
    'Pendants',
    'Finger Rings',
    'Mangalsutra',
    'Chains',
    'Nose Pin',
    'Necklaces',
    'Necklace Set',
    'Bangles',
    'Bracelets',
    'Antique',
    'Custom',
  ];
  const genders = ['All', 'Unisex', 'Women', 'Men'];
  const types = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];

  // Device detection and grid initialization
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Set appropriate default grid based on device
      if (mobile && gridCols > 3) {
        setGridCols(2); // Default mobile grid
      } else if (!mobile && gridCols < 2) {
        setGridCols(4); // Default desktop grid
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

  // Responsive grid cycling function
  const cycleGrid = () => {
    setGridCols(prev => {
      if (isMobile) {
        // Mobile: 1 → 2 → 3 → 1
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        return 1;
      } else {
        // Desktop: 2 → 3 → 4 → 6 → 2
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        if (prev === 4) return 6;
        return 2;
      }
    });
  };

  // Get grid classes based on current grid columns
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

  // Get responsive image height classes
  const getImageHeightClasses = () => {
     if (isMobile) {
      switch (gridCols) {
        case 1: return { title: 'text-lg sm:text-xl', detail: 'text-sm' };
        case 2: return { title: 'text-sm sm:text-base', detail: 'text-xs' };
        case 3: return { title: 'text-xs sm:text-sm', detail: 'text-xs' };
        default: return { title: 'text-sm sm:text-base', detail: 'text-xs' };
      }
    } else {
      switch (gridCols) {
        case 2: return 'h-56 lg:h-64';
        case 3: return 'h-48 lg:h-56';
        case 4: return 'h-40 lg:h-48';
        case 6: return 'h-32 lg:h-40';
        default: return 'h-40 lg:h-48';
      }
    }
  };

  // Get responsive text size classes
  const getTextSizeClasses = () => {
    if (isMobile) {
      switch (gridCols) {
        case 1: return { title: 'text-lg sm:text-xl', details: 'text-sm' };
        case 2: return { title: 'text-sm sm:text-base', details: 'text-xs' };
        case 3: return { title: 'text-xs sm:text-sm', details: 'text-xs' };
        default: return { title: 'text-sm sm:text-base', details: 'text-xs' };
      }
    } else {
      switch (gridCols) {
        case 2: return { title: 'text-lg lg:text-xl', details: 'text-sm lg:text-base' };
        case 3: return { title: 'text-base lg:text-lg', details: 'text-sm' };
        case 4: return { title: 'text-sm lg:text-base', details: 'text-xs lg:text-sm' };
        case 6: return { title: 'text-xs lg:text-sm', details: 'text-xs' };
        default: return { title: 'text-sm lg:text-base', details: 'text-xs lg:text-sm' };
      }
    }
  };

  // Fetch function now relies solely on the API
  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    setIsDataFetched(false);
    try {
      const params = new URLSearchParams();
      
      // Always add basic pagination params
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      
      // Add sort parameters
      if (sortByDate) {
        params.append('sortByDate', sortByDate);
      } else {
        params.append('sortField', sortField || 'clickCount');
        params.append('sortOrder', sortOrder || 'desc');
      }

      // Add filters only if they have valid values
      if (selectedCategory.length > 0 && !selectedCategory.includes('All Jewellery')) {
        params.append('catagories', selectedCategory.join(','));
      }
      
      if (selectedSubCategory && selectedSubCategory.trim() !== '') {
        params.append('subCategory', selectedSubCategory);
      }
      
      if (selectedType && selectedType !== '' && selectedType !== 'All') {
        params.append('type', selectedType);
      }
      
      if (selectedGender && selectedGender !== '' && selectedGender !== 'All') {
        params.append('gender', selectedGender);
      }
      
      if (metalFilter && metalFilter !== '' && metalFilter !== 'All') {
        params.append('metal', metalFilter);
      }
      
      if (stoneFilter && stoneFilter !== '') {
        params.append('stone', stoneFilter);
      }
      
      if (designFilter && designFilter !== '') {
        params.append('design', designFilter);
      }
      
      if (weightRanges.length > 0) {
        params.append('weightRanges', weightRanges.join(','));
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        params.append('search', searchQuery.trim());
      }
      
      if (searchId && searchId.trim() !== '') {
        params.append('searchId', searchId.trim());
      }

      console.log('API URL:', `/api/jewellery?${params.toString()}`);
      
      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

      console.log('API Response:', data);

      // Handle API response
      let items = [];
      let total = 0;
      let pages = 1;

      if (data) {
        if (Array.isArray(data)) {
          items = data;
          total = data.length;
          pages = Math.ceil(total / itemsPerPage);
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
          total = data.totalItems || data.total || data.count || 0;
          pages = data.totalPages || Math.ceil(total / itemsPerPage);
        } else if (data.data && Array.isArray(data.data)) {
          items = data.data;
          total = data.totalItems || data.total || data.count || data.data.length;
          pages = data.totalPages || Math.ceil(total / itemsPerPage);
        } else if (data.jewellery && Array.isArray(data.jewellery)) {
          items = data.jewellery;
          total = data.totalItems || data.total || data.count || data.jewellery.length;
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
        // If API returns no items, clear the state
        setJewellery([]);
        setTotalItems(0);
        setTotalPages(1);
      }

    } catch (error) {
      console.error('Failed to load jewellery:', error);
      // In case of an error, reset to an empty state
      setJewellery([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsDataFetched(true);
    }
  }, [
    currentPage,
    itemsPerPage,
    sortField,
    sortOrder,
    sortByDate,
    selectedCategory,
    selectedSubCategory,
    selectedType,
    selectedGender,
    metalFilter,
    stoneFilter,
    designFilter,
    weightRanges,
    searchQuery,
    searchId,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightRanges, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  // Enhanced item click handler with index tracking
  const handleItemClick = async (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/jewellery/${item._id}/click`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setJewellery(prev => prev.map(jewel => 
        jewel._id === item._id 
          ? { ...jewel, clickCount: response.data.clickCount || (jewel.clickCount || 0) + 1 }
          : jewel
      ));
    } catch (error) {
      console.error('Failed to update popularity:', error);
      // Fallback to update UI optimistically
      setJewellery(prev => prev.map(jewel => 
        jewel._id === item._id 
          ? { ...jewel, clickCount: (jewel.clickCount || 0) + 1 }
          : jewel
      ));
    }
  };

  // Navigation functions for item details modal
  const navigateToItem = (direction) => {
    let newIndex = selectedItemIndex;
    
    if (direction === 'next') {
      newIndex = selectedItemIndex + 1;
      if (newIndex >= jewellery.length) {
        newIndex = 0; // Wrap to first item
      }
    } else if (direction === 'prev') {
      newIndex = selectedItemIndex - 1;
      if (newIndex < 0) {
        newIndex = jewellery.length - 1; // Wrap to last item
      }
    }
    
    if (newIndex !== selectedItemIndex && jewellery[newIndex]) {
      setSelectedItem(jewellery[newIndex]);
      setSelectedItemIndex(newIndex);
      
      // Update click count for the new item
      handleItemClick(jewellery[newIndex], newIndex);
    }
  };

  // Touch event handlers for swipe detection
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
    
    if (isLeftSwipe) {
      navigateToItem('next');
    } else if (isRightSwipe) {
      navigateToItem('prev');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedItem) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToItem('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToItem('next');
      } else if (e.key === 'Escape') {
        setSelectedItem(null);
        setSelectedItemIndex(-1);
      }
    };

    if (selectedItem) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedItem, selectedItemIndex, jewellery]);

  // Helper functions for media handling
  const getItemMedia = (item) => {
    const media = [];
    
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      item.images.forEach(img => media.push({ type: 'image', src: img }));
    } else if (item.image) {
      media.push({ type: 'image', src: item.image });
    }
    
    if (item.videos && Array.isArray(item.videos) && item.videos.length > 0) {
      item.videos.forEach(vid => media.push({ type: 'video', src: vid }));
    }
    
    return media;
  };

  const getItemImages = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    } else if (item.image) {
      return [item.image];
    }
    return [];
  };

  const getMainImage = (item) => {
    const images = getItemImages(item);
    return images.length > 0 ? images[0] : null;
  };

  // Fixed pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }
    
    return range;
  };

  const getAllcatagories = () => {
    const basecatagories = catagories.filter(cat => cat !== 'All Jewellery');
    return basecatagories;
  };

  const getAllSubcatagories = () => {
    const subcatagories = jewellery
      .map(item => item.category?.sub)
      .filter(sub => sub && sub.trim() !== '')
      .filter((sub, index, arr) => arr.indexOf(sub) === index);
    
    return subcatagories.sort();
  };

  const getFilteredSubcatagories = () => {
    if (selectedCategory.length === 0) {
      return getAllSubcatagories();
    }
    
    const filteredSubcatagories = jewellery
      .filter(item => selectedCategory.includes(item.category?.main))
      .map(item => item.category?.sub)
      .filter(sub => sub && sub.trim() !== '')
      .filter((sub, index, arr) => arr.indexOf(sub) === index);
    
    return filteredSubcatagories.sort();
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedSubCategory('');
    setSelectedType('');
    setSelectedGender('');
    setStoneFilter('');
    setMetalFilter('');
    setWeightRanges([]);
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
    if (sortField === 'orderNo' && sortOrder === 'asc') return 'Order No: Low to High';
    if (sortField === 'orderNo' && sortOrder === 'desc') return 'Order No: High to Low';
    if (sortField === 'clickCount' && sortOrder === 'desc') return 'Popularity: Most Popular First';
    if (sortField === 'clickCount' && sortOrder === 'asc') return 'Popularity: Least Popular First';
    return 'Most Popular First';
  };

  const openMediaModal = (media, startIndex = 0) => {
    setModalMedia(media);
    setCurrentMediaIndex(startIndex);
  };

  const closeMediaModal = () => {
    setModalMedia([]);
    setCurrentMediaIndex(0);
  };

  const navigateMedia = (direction) => {
    if (direction === 'next') {
      setCurrentMediaIndex(prev => (prev + 1) % modalMedia.length);
    } else {
      setCurrentMediaIndex(prev => (prev - 1 + modalMedia.length) % modalMedia.length);
    }
  };

  // Get grid icon based on current state
  const getGridIcon = () => {
    if (isMobile) {
      switch (gridCols) {
        case 1:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          );
        case 2:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" />
            </svg>
          );
        case 3:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4M4 12h4M4 18h4M10 6h4M10 12h4M10 18h4M16 6h4M16 12h4M16 18h4" />
            </svg>
          );
        default:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" />
            </svg>
          );
      }
    } else {
      switch (gridCols) {
        case 2:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" />
            </svg>
          );
        case 3:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4M4 12h4M4 18h4M10 6h4M10 12h4M10 18h4M16 6h4M16 12h4M16 18h4" />
            </svg>
          );
        case 4:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="4" height="4" />
              <rect x="10" y="3" width="4" height="4" />
              <rect x="17" y="3" width="4" height="4" />
              <rect x="3" y="10" width="4" height="4" />
              <rect x="10" y="10" width="4" height="4" />
              <rect x="17" y="10" width="4" height="4" />
              <rect x="3" y="17" width="4" height="4" />
              <rect x="10" y="17" width="4" height="4" />
              <rect x="17" y="17" width="4" height="4" />
            </svg>
          );
        case 6:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="3" height="3" />
              <rect x="6" y="3" width="3" height="3" />
              <rect x="10" y="3" width="3" height="3" />
              <rect x="14" y="3" width="3" height="3" />
              <rect x="18" y="3" width="3" height="3" />
              <rect x="2" y="10" width="3" height="3" />
              <rect x="6" y="10" width="3" height="3" />
              <rect x="10" y="10" width="3" height="3" />
              <rect x="14" y="10" width="3" height="3" />
              <rect x="18" y="10" width="3" height="3" />
              <rect x="2" y="17" width="3" height="3" />
              <rect x="6" y="17" width="3" height="3" />
              <rect x="10" y="17" width="3" height="3" />
              <rect x="14" y="17" width="3" height="3" />
              <rect x="18" y="17" width="3" height="3" />
            </svg>
          );
        default:
          return (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="4" height="4" />
              <rect x="10" y="3" width="4" height="4" />
              <rect x="17" y="3" width="4" height="4" />
              <rect x="3" y="10" width="4" height="4" />
              <rect x="10" y="10" width="4" height="4" />
              <rect x="17" y="10" width="4" height="4" />
              <rect x="3" y="17" width="4" height="4" />
              <rect x="10" y="17" width="4" height="4" />
              <rect x="17" y="17" width="4" height="4" />
            </svg>
          );
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 min-h-screen">
      {/* Header with Logo and Company Name */}
      <div className="bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-orange-400/90 backdrop-blur-md fixed top-0 left-0 w-full z-[90] shadow-2xl p-4 border-b border-amber-300/50">
        <div className="flex items-center gap-4 justify-center sm:justify-start">
          <div className="relative">
            <img
              src="logo.png"
              alt="Logo"
              loading="lazy"
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-3 border-white shadow-xl ring-4 ring-amber-200/50"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide drop-shadow-lg">
              VIMALESHWARA JEWELLERS
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm font-medium">Premium Jewellery Collection</p>
          </div>
        </div>
      </div>

      {/* Combined Search, Filter, Sort Controls in One Box */}
      <div className="bg-white/95 backdrop-blur-md fixed top-20 sm:top-24 left-0 w-full z-[85] shadow-lg p-4 border-b border-amber-200">
        <div className="w-full max-w-5xl mx-auto">
          {/* Search Bar Row */}
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
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Grid Toggle Button - Right side of search */}
              <button
                onClick={cycleGrid}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-1"
                title={`Grid: ${gridCols} column${gridCols > 1 ? 's' : ''} (${isMobile ? 'Mobile' : 'Desktop'})`}
              >
                {getGridIcon()}
                <span className="text-xs font-bold hidden sm:inline">{gridCols}</span>
              </button>
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter and Sort Controls Row */}
          <div className="flex items-center justify-center gap-3">
            {/* Filter By Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterPanel(!showFilterPanel);
                  setShowSortPanel(false);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm sm:text-base">Filter</span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform duration-300 ${showFilterPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Filter Dropdown Panel */}
              {showFilterPanel && (
                <div className="absolute top-full mt-2 left-0 w-80 sm:w-96 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                  <div className="space-y-4">
                    
                    {/* Category Multi-Select */}
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
                                setSelectedCategory((prev) =>
                                  e.target.checked
                                    ? [...prev, value]
                                    : prev.filter((v) => v !== value)
                                );
                                if (!e.target.checked) {
                                  setSelectedSubCategory('');
                                }
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sub-Category */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Sub-Category</label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">All Sub-Categories</option>
                        {getFilteredSubcatagories().map((subCat) => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {types.map((typeOpt, i) => (
                          <option key={i} value={typeOpt === 'All' ? '' : typeOpt}>
                            {typeOpt === 'All' ? 'All Types' : typeOpt[0].toUpperCase() + typeOpt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Gender</label>
                      <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {genders.map((gender, idx) => (
                          <option key={idx} value={gender === 'All' ? '' : gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Metal */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Metal</label>
                      <select
                        value={metalFilter}
                        onChange={(e) => setMetalFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {metals.map((metal, idx) => (
                          <option key={idx} value={metal === 'All' ? '' : metal}>
                            {metal === 'All' ? 'All Metals' : metal[0].toUpperCase() + metal.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stone */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Stone</label>
                      <select
                        value={stoneFilter}
                        onChange={(e) => setStoneFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">All Stones</option>
                        <option value="with">With Stone</option>
                        <option value="without">Without Stone</option>
                      </select>
                    </div>

                    {/* Design */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Design</label>
                      <select
                        value={designFilter}
                        onChange={(e) => setDesignFilter(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">All Designs</option>
                        <option value="our">In House</option>
                        <option value="Others">Others Design</option>
                      </select>
                    </div>

                    {/* Weight Range */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Weight Range</label>
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50">
                        {[
                          '0-2', '2-4', '4-6', '6-8', '8-10', '10-15', '15-20', '20-25',
                          '25-30', '30-35', '35-40', '40-45', '45-50', '50-75', '75-+'
                        ].map((range) => (
                          <label key={range} className="flex items-center gap-2 text-sm p-1 hover:bg-blue-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              value={range}
                              checked={weightRanges.includes(range)}
                              onChange={(e) => {
                                const value = e.target.value;
                                setWeightRanges((prev) =>
                                  e.target.checked
                                    ? [...prev, value]
                                    : prev.filter((r) => r !== value)
                                );
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span>{range.replace('-', '–').replace('+', 'g+')}g</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Search by ID */}
                    <div>
                      <label className="block font-bold text-blue-700 mb-2">Search by ID</label>
                      <input
                        type="text"
                        placeholder="Search by ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Clear Filters Button */}
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortPanel(!showSortPanel);
                  setShowFilterPanel(false);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span className="text-sm sm:text-base">Sort</span>
                <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform duration-300 ${
                    showSortPanel ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Sort Dropdown Panel */}
              {showSortPanel && (
                <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white border-2 border-purple-300 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                  <div className="space-y-4">
                    {/* Current Sort Display */}
                    <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-300">
                      <h3 className="font-bold text-purple-700 mb-2">Current Sort</h3>
                      <p className="text-purple-600 font-semibold">
                        {getActiveSortDescription()}
                      </p>
                    </div>

                    {/* Sort by Field */}
                    <div>
                      <label className="block font-bold text-purple-700 mb-2">
                        Sort By Field
                      </label>
                      <select
                        value={sortField}
                        onChange={(e) => {
                          setSortField(e.target.value);
                          setSortOrder("desc");
                          setSortByDate("");
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      >
                        <option value="clickCount">Popularity</option>
                        <option value="weight">Weight</option>
                        <option value="orderNo">Order Number</option>
                      </select>
                    </div>

                    {/* Sort Direction */}
                    <div>
                      <label className="block font-bold text-purple-700 mb-2">
                        Sort Direction
                      </label>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSortOrder("asc");
                            setSortByDate("");
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortOrder === "asc" && !sortByDate
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300"
                          }`}
                        >
                          {sortField === "clickCount"
                            ? "Least Popular First"
                            : "Low to High (Ascending)"}
                        </button>
                        <button
                          onClick={() => {
                            setSortOrder("desc");
                            setSortByDate("");
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortOrder === "desc" && !sortByDate
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300"
                          }`}
                        >
                          {sortField === "clickCount"
                            ? "Most Popular First"
                            : "High to Low (Descending)"}
                        </button>
                      </div>
                    </div>

                    {/* Sort by Date */}
                    <div>
                      <label className="block font-bold text-purple-700 mb-2">
                        Sort by Date
                      </label>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSortByDate("newest");
                            setSortOrder("");
                            setSortField("");
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortByDate === "newest"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                          }`}
                        >
                          Newest First
                        </button>
                        <button
                          onClick={() => {
                            setSortByDate("oldest");
                            setSortOrder("");
                            setSortField("");
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortByDate === "oldest"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                          }`}
                        >
                          Oldest First
                        </button>
                      </div>
                    </div>

                    {/* Clear Sort Button */}
                    <button
                      onClick={clearAllSorts}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reset to Most Popular
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for closing dropdowns */}
      {(showFilterPanel || showSortPanel) && (
        <div 
          className="fixed inset-0 z-[70]" 
          onClick={() => {
            setShowFilterPanel(false);
            setShowSortPanel(false);
          }}
        />
      )}

      {/* Content with proper spacing for the combined control box */}
      <div className="pt-60 sm:pt-64">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-amber-700">Loading jewellery...</p>
            </div>
          </div>
        )}

        {/* Results Info - Only show if items exist */}
        {isDataFetched && totalItems > 0 && (
          <div className="px-4 sm:px-6 mb-6">
            <div className="bg-gradient-to-r from-white/90 to-amber-50/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-amber-200 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-800">
                      Showing {jewellery.length} of {totalItems} items
                    </p>
                    {totalPages > 1 && (
                      <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} • Grid: {gridCols} column{gridCols > 1 ? 's' : ''} ({isMobile ? 'Mobile' : 'Desktop'})
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-white/80 px-3 py-2 rounded-lg border border-amber-200">
                  {getActiveSortDescription()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Cards Grid - Responsive with new grid system */}
        <div className={`gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-6 pb-8 ${getGridClasses()}`}>
          {!loading && jewellery.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl sm:text-8xl mb-6 animate-bounce">💎</div>
              <p className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">No jewellery items found.</p>
              <p className="text-gray-500 text-base sm:text-lg">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            jewellery.map((item, index) => {
              const itemImages = getItemImages(item);
              const mainImage = getMainImage(item);
              const textSizes = getTextSizeClasses();
              
              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item, index)}
                  className="bg-gradient-to-br from-white via-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 cursor-pointer group overflow-hidden relative"
                >
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Enhanced Media Section */}
                  {mainImage && (
                    <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                      <img
                        src={mainImage}
                        alt={item.name}
                        loading="lazy"
                        className={`w-full object-cover border-2 border-amber-200 group-hover:scale-110 transition-transform duration-500 ${getImageHeightClasses()}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Media Indicators */}
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex gap-1">
                        {itemImages.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {itemImages.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Popularity badge */}
                      {/* {item.clickCount > 0 && (
                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                          🔥 {item.clickCount}
                        </div>
                      )} */}
                      
                      {/* Design Ownership Badge */}
                      <div className={`absolute bottom-1 sm:bottom-2 left-1 sm:left-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg ${
                        item.isOurDesign === false 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {item.isOurDesign === false ? '👤' : '🏪'}
                      </div>
                    </div>
                  )}
                  
                  {/* Responsive Text Section */}
                  <div className="space-y-1">
                    <h2 className={`font-bold text-amber-900 truncate group-hover:text-amber-800 transition-colors duration-300 ${textSizes.title}`}>
                      {item.name}
                    </h2>
                    
                    <div className={`flex items-center justify-between text-gray-600 ${textSizes.details}`}>
                      <span className="font-semibold text-amber-700">{item.weight}g</span>
                      <span className="font-semibold truncate ml-1">{item.category?.main}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Enhanced Pagination Controls */}
        {isDataFetched && totalPages > 1 && jewellery.length > 0 && (
          <div className="px-4 sm:px-6 pb-8 mt-8">
            <div className="bg-gradient-to-r from-white/95 via-amber-50/95 to-orange-50/95 backdrop-blur-md rounded-2xl p-6 border-2 border-amber-300 shadow-2xl">
              <div className="flex flex-col items-center gap-6">
                {/* Pagination Info */}
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-800 mb-2">
                    Page {currentPage} of {totalPages}
                  </p>
                  <p className="text-sm text-gray-600">
                    Showing {jewellery.length} items per page • {totalItems} total items
                  </p>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                      currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* First page if not in range */}
                    {!getPaginationRange().includes(1) && totalPages > 5 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="w-10 h-10 rounded-lg font-bold transition-all duration-300 bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                        >
                          1
                        </button>
                        <span className="px-2 text-gray-500">...</span>
                      </>
                    )}

                    {getPaginationRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-110'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Last page if not in range */}
                    {!getPaginationRange().includes(totalPages) && totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="w-10 h-10 rounded-lg font-bold transition-all duration-300 bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:border-amber-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                      currentPage === totalPages
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Quick Jump to Page */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Jump to page:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    placeholder={currentPage.toString()}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        goToPage(page);
                      }
                    }}
                    className="w-20 px-2 py-1 text-center border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  <span className="text-sm text-gray-600">of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Item Details Popup with Navigation and Swipe Support */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[95] flex items-center justify-center p-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Enhanced Header with Navigation */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateToItem('prev')}
                  className="text-white hover:text-amber-200 transition-colors duration-200 p-1 rounded-lg hover:bg-black/10"
                  title="Previous Item (← or swipe right)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h2 className="text-lg font-black text-white truncate max-w-md">
                  {selectedItem.name}
                </h2>
                
                <button
                  onClick={() => navigateToItem('next')}
                  className="text-white hover:text-amber-200 transition-colors duration-200 p-1 rounded-lg hover:bg-black/10"
                  title="Next Item (→ or swipe left)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-white text-sm font-semibold bg-black/20 px-3 py-1 rounded-full">
                  {selectedItemIndex + 1} / {jewellery.length}
                </div>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setSelectedItemIndex(-1);
                  }}
                  className="text-white hover:text-red-200 transition-colors duration-200 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Image Section - 60% width on large screens, larger image */}
              <div className="lg:w-3/5 p-6 flex flex-col">
                {(() => {
                  const itemMedia = getItemMedia(selectedItem);
                  const mainImage = getMainImage(selectedItem);
                  
                  if (!mainImage) return null;
                  
                  return (
                    <>
                      {/* Main Image - Much Larger */}
                      <div className="flex-1 flex items-center justify-center mb-4">
                        <img
                          src={mainImage}
                          alt={selectedItem.name}
                          loading="lazy"
                          onClick={() => openMediaModal(itemMedia, 0)}
                          className="max-w-full max-h-96 object-contain rounded-xl cursor-pointer border border-amber-200 hover:border-amber-400 transition-all duration-300 shadow-lg"
                        />
                      </div>
                      
                      {/* Thumbnail Gallery */}
                      {itemMedia.length > 1 && (
                        <div className="flex justify-center gap-2 flex-wrap">
                          {itemMedia.slice(1, 5).map((media, index) => (
                            <div
                              key={index + 1}
                              onClick={() => openMediaModal(itemMedia, index + 1)}
                              className="w-16 h-16 rounded-lg cursor-pointer border border-amber-200 hover:border-amber-400 transition-all duration-300 overflow-hidden flex-shrink-0"
                            >
                              {media.type === 'image' ? (
                                <img
                                  src={media.src}
                                  alt={`${selectedItem.name} ${index + 2}`}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                          {itemMedia.length > 5 && (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                              +{itemMedia.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Swipe Instructions */}
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                          Swipe left/right to navigate • Use ←/→ keys • Tap image for gallery
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Details Section - 40% width, Two Columns Layout */}
              <div className="lg:w-2/5 p-6 bg-gray-50 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 bg-white p-3 rounded-lg border-2 border-amber-200">
                    <span className="font-semibold text-gray-700">ID:</span>
                    <div className="font-bold text-amber-700 mt-1">{selectedItem.id}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Weight</span>
                    <div className="font-bold text-amber-700">{selectedItem.weight}g</div>
                  </div>
                  
                  {selectedItem.stoneWeight && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="font-semibold text-gray-700 text-xs">Stone Weight</span>
                      <div className="font-bold text-amber-700">{selectedItem.stoneWeight}g</div>
                    </div>
                  )}
                  
                  {selectedItem.carat && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="font-semibold text-gray-700 text-xs">Carat</span>
                      <div className="font-bold text-amber-700">{selectedItem.carat}</div>
                    </div>
                  )}
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Metal</span>
                    <div className="font-bold text-amber-700 capitalize">{selectedItem.metal}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Type</span>
                    <div className="font-bold text-amber-700 capitalize">{selectedItem.type}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Gender</span>
                    <div className="font-bold text-amber-700">{selectedItem.gender}</div>
                  </div>
                  
                  <div className="col-span-2 bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Category</span>
                    <div className="font-bold text-amber-700">{selectedItem.category?.main}{selectedItem.category?.sub && ` - ${selectedItem.category.sub}`}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Views</span>
                    <div className="font-bold text-amber-700">{selectedItem.clickCount || 0}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="font-semibold text-gray-700 text-xs">Design</span>
                    <div className="font-bold text-amber-700">{selectedItem.isOurDesign === false ? 'Others' : 'In House'}</div>
                  </div>
                  
                  {selectedItem.orderNo !== undefined && selectedItem.orderNo !== null && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="font-semibold text-gray-700 text-xs">Order No</span>
                      <div className="font-bold text-amber-700">{selectedItem.orderNo}</div>
                    </div>
                  )}
                  
                  {selectedItem.date && (
                    <div className="bg-white p-3 rounded-lg border">
                      <span className="font-semibold text-gray-700 text-xs">Date</span>
                      <div className="font-bold text-amber-700">{new Date(selectedItem.date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Media Gallery Modal - Better orientation support */}
      {modalMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
            {/* Close Button */}
            <button
              onClick={closeMediaModal}
              className="absolute top-4 right-4 z-20 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {modalMedia.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main Media - Enhanced for both orientations */}
            <div className="w-full h-full flex items-center justify-center">
              {modalMedia[currentMediaIndex].type === 'image' ? (
                <img
                  src={modalMedia[currentMediaIndex].src}
                  alt={`Gallery ${currentMediaIndex + 1}`}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain rounded-lg border-4 border-white/20"
                  style={{ 
                    maxWidth: 'calc(100vw - 2rem)', 
                    maxHeight: 'calc(100vh - 2rem)' 
                  }}
                />
              ) : (
                <video
                  src={modalMedia[currentMediaIndex].src}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-lg border-4 border-white/20"
                  style={{ 
                    maxWidth: 'calc(100vw - 2rem)', 
                    maxHeight: 'calc(100vh - 2rem)' 
                  }}
                />
              )}
            </div>

            {/* Media Counter */}
            {modalMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                {currentMediaIndex + 1} / {modalMedia.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCatalogue;