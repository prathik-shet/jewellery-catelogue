import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function UserCatalogue() {
  const [jewellery, setJewellery] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortByDate, setSortByDate] = useState('');
  const [stoneFilter, setStoneFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [weightRange, setWeightRange] = useState([0, 200]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [designFilter, setDesignFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [sortField, setSortField] = useState('weight');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

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

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && gridCols > 3) {
        setGridCols(2);
      } else if (!mobile && gridCols < 2) {
        setGridCols(4);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [gridCols]);

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
        case 1: return 'h-64 sm:h-72';
        case 2: return 'h-40 sm:h-48';
        case 3: return 'h-32 sm:h-40';
        default: return 'h-40 sm:h-48';
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

  const fetchJewellery = useCallback(async () => {
    setLoading(true);
    setIsDataFetched(false);
    try {
      const params = new URLSearchParams();

      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());

      if (sortByDate) {
        params.append('sortByDate', sortByDate);
      } else if (sortField) {
        params.append('sortField', sortField);
        params.append('sortOrder', sortOrder || 'desc');
      }

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

      if (weightRange[0] > 0 || weightRange[1] < 200) {
        params.append('minWeight', weightRange[0].toString());
        params.append('maxWeight', weightRange[1].toString());
      }

      if (searchQuery && searchQuery.trim() !== '') {
        params.append('search', searchQuery.trim());
      }

      if (searchId && searchId.trim() !== '') {
        params.append('searchId', searchId.trim());
      }

      const res = await axios.get(`/api/jewellery?${params.toString()}`);
      const data = res.data;

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
    weightRange,
    searchQuery,
    searchId,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightRange, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

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
    }
  };

  const navigateToItem = (direction) => {
    let newIndex = selectedItemIndex;

    if (direction === 'next') {
      newIndex = selectedItemIndex + 1;
      if (newIndex >= jewellery.length) {
        newIndex = 0;
      }
    } else if (direction === 'prev') {
      newIndex = selectedItemIndex - 1;
      if (newIndex < 0) {
        newIndex = jewellery.length - 1;
      }
    }

    if (newIndex !== selectedItemIndex && jewellery[newIndex]) {
      setSelectedItem(jewellery[newIndex]);
      setSelectedItemIndex(newIndex);
      handleItemClick(jewellery[newIndex], newIndex);
    }
  };

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

  const getItemImages = (item) => {
    if (!item) return [];

    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images.filter(Boolean);
    }

    if (item.image) {
      return [item.image];
    }

    return [];
  };

  const getItemVideos = (item) => {
    if (!item) return [];

    if (Array.isArray(item.videos) && item.videos.length > 0) {
      return item.videos.filter(Boolean);
    }

    return [];
  };

  const getMainImage = (item) => {
    const images = getItemImages(item);
    return images.length > 0 ? images[0] : null;
  };

  const getItemMedia = (item) => {
    if (!item) return [];

    const media = [];

    getItemImages(item).forEach((img) => {
      media.push({ type: 'image', src: img });
    });

    getItemVideos(item).forEach((vid) => {
      media.push({ type: 'video', src: vid });
    });

    return media;
  };

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
    setWeightRange([0, 200]);
    setSearchQuery('');
    setSearchId('');
    setDesignFilter('');
    setCurrentPage(1);
  };

  const clearAllSorts = () => {
    setSortField('weight');
    setSortOrder('desc');
    setSortByDate('');
    setCurrentPage(1);
  };

  const getActiveSortDescription = () => {
    if (sortByDate === 'newest') return 'Date: Newest First';
    if (sortByDate === 'oldest') return 'Date: Oldest First';
    if (sortField === 'weight' && sortOrder === 'asc') return 'Weight: Light to Heavy';
    if (sortField === 'weight' && sortOrder === 'desc') return 'Weight: Heavy to Light';
    return 'Weight: Heavy to Light';
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
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen">
      <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 fixed top-0 left-0 w-full z-[90] shadow-2xl border-b border-slate-700">
        <div className="flex items-center gap-4 justify-center sm:justify-start p-4">
          <div className="relative">
            <img
              src="logo.png"
              alt="Logo"
              loading="lazy"
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-3 border-amber-400 shadow-2xl ring-4 ring-amber-500/30"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 tracking-wide">
              VIMALESHWARA JEWELLERS
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">Exquisite Jewellery Collection</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl fixed top-20 sm:top-24 left-0 w-full z-[85] shadow-xl border-b border-slate-200">
        <div className="w-full max-w-5xl mx-auto p-4">
          <div className="relative mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jewellery by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-16 py-3 bg-white border-2 border-slate-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200/30 transition-all duration-300 text-sm sm:text-base font-medium shadow-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                onClick={cycleGrid}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-2 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 flex items-center gap-1 shadow-lg"
                title={`Grid: ${gridCols} column${gridCols > 1 ? 's' : ''}`}
              >
                {getGridIcon()}
                <span className="text-xs font-bold hidden sm:inline">{gridCols}</span>
              </button>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterPanel(!showFilterPanel);
                  setShowSortPanel(false);
                }}
                className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:from-slate-800 hover:to-slate-900 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm sm:text-base">Filter</span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform duration-300 ${showFilterPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilterPanel && (
                <div className="absolute top-full mt-2 left-0 w-80 sm:w-96 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                  <div className="space-y-4">

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Categories</label>
                      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                        {getAllcatagories().map((cat) => (
                          <label key={cat} className="flex items-center gap-2 text-sm p-1 hover:bg-slate-100 rounded cursor-pointer">
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
                              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Sub-Category</label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                      >
                        <option value="">All Sub-Categories</option>
                        {getFilteredSubcatagories().map((subCat) => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                      >
                        {types.map((typeOpt, i) => (
                          <option key={i} value={typeOpt === 'All' ? '' : typeOpt}>
                            {typeOpt === 'All' ? 'All Types' : typeOpt[0].toUpperCase() + typeOpt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Gender</label>
                      <select
                        value={selectedGender}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                      >
                        {genders.map((gender, idx) => (
                          <option key={idx} value={gender === 'All' ? '' : gender}>
                            {gender}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Metal</label>
                      <select
                        value={metalFilter}
                        onChange={(e) => setMetalFilter(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                      >
                        {metals.map((metal, idx) => (
                          <option key={idx} value={metal === 'All' ? '' : metal}>
                            {metal === 'All' ? 'All Metals' : metal[0].toUpperCase() + metal.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Stone</label>
                      <select
                        value={stoneFilter}
                        onChange={(e) => setStoneFilter(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                      >
                        <option value="">All Stones</option>
                        <option value="with">With Stone</option>
                        <option value="without">Without Stone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Design</label>
                      <select
                        value={designFilter}
                        onChange={(e) => setDesignFilter(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-white"
                      >
                        <option value="">All Designs</option>
                        <option value="our">In House</option>
                        <option value="Others">Others Design</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-3">
                        Weight Range: {weightRange[0]}g - {weightRange[1]}g
                      </label>
                      <div className="px-2">
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={weightRange[0]}
                            onChange={(e) => {
                              const newMin = parseInt(e.target.value);
                              if (newMin <= weightRange[1]) {
                                setWeightRange([newMin, weightRange[1]]);
                              }
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={weightRange[1]}
                            onChange={(e) => {
                              const newMax = parseInt(e.target.value);
                              if (newMax >= weightRange[0]) {
                                setWeightRange([weightRange[0], newMax]);
                              }
                            }}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-2"
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-600">
                          <span>0g</span>
                          <span>200g</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Search by ID</label>
                      <input
                        type="text"
                        placeholder="Enter ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                      />
                    </div>

                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
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

            <div className="relative">
              <button
                onClick={() => {
                  setShowSortPanel(!showSortPanel);
                  setShowFilterPanel(false);
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:from-amber-600 hover:to-amber-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-sm sm:text-base">Sort</span>
                <svg className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform duration-300 ${showSortPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSortPanel && (
                <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                      <h3 className="font-bold text-amber-800 mb-2">Current Sort</h3>
                      <p className="text-amber-700 font-semibold">
                        {getActiveSortDescription()}
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Sort by Weight</label>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSortField('weight');
                            setSortOrder('asc');
                            setSortByDate('');
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortField === 'weight' && sortOrder === 'asc' && !sortByDate
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-600 shadow-lg'
                              : 'bg-white text-gray-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                          }`}
                        >
                          Light to Heavy
                        </button>
                        <button
                          onClick={() => {
                            setSortField('weight');
                            setSortOrder('desc');
                            setSortByDate('');
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortField === 'weight' && sortOrder === 'desc' && !sortByDate
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-600 shadow-lg'
                              : 'bg-white text-gray-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                          }`}
                        >
                          Heavy to Light
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-2">Sort by Date</label>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setSortByDate('newest');
                            setSortOrder('');
                            setSortField('');
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortByDate === 'newest'
                              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border-slate-900 shadow-lg'
                              : 'bg-white text-gray-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          Newest First
                        </button>
                        <button
                          onClick={() => {
                            setSortByDate('oldest');
                            setSortOrder('');
                            setSortField('');
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            sortByDate === 'oldest'
                              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border-slate-900 shadow-lg'
                              : 'bg-white text-gray-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          Oldest First
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={clearAllSorts}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Sort
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(showFilterPanel || showSortPanel) && (
        <div
          className="fixed inset-0 z-[70]"
          onClick={() => {
            setShowFilterPanel(false);
            setShowSortPanel(false);
          }}
        />
      )}

      <div className="pt-60 sm:pt-64">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-slate-700">Loading jewellery...</p>
            </div>
          </div>
        )}

        {isDataFetched && totalItems > 0 && (
          <div className="px-4 sm:px-6 mb-6">
            <div className="bg-gradient-to-r from-white to-slate-50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">
                      Showing {jewellery.length} of {totalItems} items
                    </p>
                    {totalPages > 1 && (
                      <p className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages} • Grid: {gridCols} column{gridCols > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 font-medium">
                  {getActiveSortDescription()}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-4 lg:px-6 pb-8 ${getGridClasses()}`}>
          {!loading && jewellery.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl sm:text-8xl mb-6 animate-bounce">💎</div>
              <p className="text-xl sm:text-2xl font-bold text-slate-700 mb-2">No jewellery items found.</p>
              <p className="text-slate-500 text-base sm:text-lg">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            jewellery.map((item, index) => {
              const mainImage = getMainImage(item);
              const textSizes = getTextSizeClasses();
              const itemMedia = getItemMedia(item);

              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item, index)}
                  className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-500 cursor-pointer group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {mainImage && (
                    <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                      <img
                        src={mainImage}
                        alt={item.name}
                        loading="lazy"
                        className={`w-full object-cover border border-slate-200 group-hover:scale-110 transition-transform duration-500 ${getImageHeightClasses()}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex gap-1">
                        {itemMedia.length > 0 && (
                          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {itemMedia.length}
                          </div>
                        )}
                      </div>

                      <div className={`absolute bottom-1 sm:bottom-2 left-1 sm:left-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-lg ${
                        item.isOurDesign === false
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      }`}>
                        {item.isOurDesign === false ? '👤' : '🏪'}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 relative z-10">
                    <h2 className={`font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors duration-300 ${textSizes.title}`}>
                      {item.name}
                    </h2>

                    <div className={`flex items-center justify-between text-slate-600 ${textSizes.details}`}>
                      <span className="font-semibold text-amber-600">{item.weight}g</span>
                      <span className="font-medium truncate ml-1">{item.category?.main}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {isDataFetched && totalPages > 1 && jewellery.length > 0 && (
          <div className="px-4 sm:px-6 pb-8 mt-8">
            <div className="bg-white backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-xl">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    Page {currentPage} of {totalPages}
                  </p>
                  <p className="text-sm text-slate-600">
                    Showing {jewellery.length} items per page • {totalItems} total items
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                      currentPage === 1
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center gap-1 flex-wrap">
                    {!getPaginationRange().includes(1) && totalPages > 5 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="w-10 h-10 rounded-lg font-bold transition-all duration-300 bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                        >
                          1
                        </button>
                        <span className="px-2 text-slate-400">...</span>
                      </>
                    )}

                    {getPaginationRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all duration-300 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg transform scale-110'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {!getPaginationRange().includes(totalPages) && totalPages > 5 && (
                      <>
                        <span className="px-2 text-slate-400">...</span>
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="w-10 h-10 rounded-lg font-bold transition-all duration-300 bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                      currentPage === totalPages
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 transform hover:scale-105 shadow-lg'
                    }`}
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">Jump to page:</span>
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
                    className="w-20 px-3 py-2 text-center border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  <span className="text-sm text-slate-600">of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[95] flex items-center justify-center p-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateToItem('prev')}
                  className="text-white hover:text-amber-400 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                  title="Previous Item"
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
                  className="text-white hover:text-amber-400 transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
                  title="Next Item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-white text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                  {selectedItemIndex + 1} / {jewellery.length}
                </div>
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setSelectedItemIndex(-1);
                  }}
                  className="text-white hover:text-red-400 transition-colors duration-200 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <div className="lg:w-3/5 p-6 flex flex-col">
                {(() => {
                  const itemMedia = getItemMedia(selectedItem);
                  const mainImage = getMainImage(selectedItem);

                  if (!mainImage) return null;

                  return (
                    <>
                      <div className="flex-1 flex items-center justify-center mb-4">
                        <img
                          src={mainImage}
                          alt={selectedItem.name}
                          loading="lazy"
                          onClick={() => openMediaModal(itemMedia, 0)}
                          className="max-w-full max-h-96 object-contain rounded-xl cursor-pointer border-2 border-slate-200 hover:border-amber-400 transition-all duration-300 shadow-xl"
                        />
                      </div>

                      {itemMedia.length > 1 && (
                        <div className="flex justify-center gap-2 flex-wrap">
                          {itemMedia.slice(1, 5).map((media, index) => (
                            <div
                              key={index + 1}
                              onClick={() => openMediaModal(itemMedia, index + 1)}
                              className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-200 hover:border-amber-400 transition-all duration-300 overflow-hidden flex-shrink-0 shadow-md"
                            >
                              {media.type === 'image' ? (
                                <img
                                  src={media.src}
                                  alt={`${selectedItem.name} ${index + 2}`}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                          {itemMedia.length > 5 && (
                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border-2 border-slate-200">
                              +{itemMedia.length - 5}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 text-center">
                        <p className="text-xs text-slate-500">
                          Swipe or use arrow keys to navigate • Tap image for gallery
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="lg:w-2/5 p-6 bg-slate-50 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2 bg-white p-3 rounded-lg border-2 border-amber-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs">ID</span>
                    <div className="font-bold text-amber-600 mt-1">{selectedItem.id}</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs block mb-1">Weight</span>
                    <div className="font-bold text-amber-600">{selectedItem.weight}g</div>
                  </div>

                  {selectedItem.stoneWeight && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <span className="font-semibold text-slate-700 text-xs block mb-1">Stone Weight</span>
                      <div className="font-bold text-amber-600">{selectedItem.stoneWeight}g</div>
                    </div>
                  )}

                  {selectedItem.carat && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <span className="font-semibold text-slate-700 text-xs block mb-1">Carat</span>
                      <div className="font-bold text-amber-600">{selectedItem.carat}</div>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs block mb-1">Metal</span>
                    <div className="font-bold text-amber-600 capitalize">{selectedItem.metal}</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs block mb-1">Type</span>
                    <div className="font-bold text-amber-600 capitalize">{selectedItem.type}</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs block mb-1">Gender</span>
                    <div className="font-bold text-amber-600">{selectedItem.gender}</div>
                  </div>

                  <div className="col-span-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs block mb-1">Category</span>
                    <div className="font-bold text-amber-600">{selectedItem.category?.main}{selectedItem.category?.sub && ` - ${selectedItem.category.sub}`}</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="font-semibold text-slate-700 text-xs block mb-1">Design</span>
                    <div className="font-bold text-amber-600">{selectedItem.isOurDesign === false ? 'Others' : 'In House'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[999] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
            <button
              onClick={closeMediaModal}
              className="absolute top-4 right-4 z-20 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

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

            <div className="w-full h-full flex items-center justify-center">
              {modalMedia[currentMediaIndex].type === 'image' ? (
                <img
                  src={modalMedia[currentMediaIndex].src}
                  alt={`Gallery ${currentMediaIndex + 1}`}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain rounded-lg"
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
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{
                    maxWidth: 'calc(100vw - 2rem)',
                    maxHeight: 'calc(100vh - 2rem)'
                  }}
                />
              )}
            </div>

            {modalMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm font-semibold">
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
