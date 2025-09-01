import React, { useEffect, useState } from 'react';
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
  
  // Enhanced modal media handling
  const [modalMedia, setModalMedia] = useState([]); // Combined images and videos
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const [gridCols, setGridCols] = useState(2);
  const [sortField, setSortField] = useState('clickCount');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [designFilter, setDesignFilter] = useState('');

  const categories = [
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
  const types = ['All', 'wedding', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];

  useEffect(() => {
    fetchJewellery();
  }, []);

  const fetchJewellery = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/jewellery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        setJewellery(data);
      } else if (data && Array.isArray(data.items)) {
        setJewellery(data.items);
      } else {
        console.error('Unexpected response format:', data);
        setJewellery([]);
      }
    } catch (error) {
      console.error('Failed to load jewellery:', error);
      alert('Failed to load jewellery.');
      setJewellery([]);
    }
  };

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    
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
      setJewellery(prev => prev.map(jewel => 
        jewel._id === item._id 
          ? { ...jewel, clickCount: (jewel.clickCount || 0) + 1 }
          : jewel
      ));
    }
  };

  // Enhanced helper function to get all media (images + videos) from an item
  const getItemMedia = (item) => {
    const media = [];
    
    // Add images
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      item.images.forEach(img => media.push({ type: 'image', src: img }));
    } else if (item.image) {
      media.push({ type: 'image', src: item.image });
    }
    
    // Add videos
    if (item.videos && Array.isArray(item.videos) && item.videos.length > 0) {
      item.videos.forEach(vid => media.push({ type: 'video', src: vid }));
    }
    
    return media;
  };

  // Helper function to get all images from an item
  const getItemImages = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    } else if (item.image) {
      return [item.image];
    }
    return [];
  };

  // Helper function to get all videos from an item
  const getItemVideos = (item) => {
    if (item.videos && Array.isArray(item.videos) && item.videos.length > 0) {
      return item.videos;
    }
    return [];
  };

  // Helper function to get the main image
  const getMainImage = (item) => {
    const images = getItemImages(item);
    return images.length > 0 ? images[0] : null;
  };

  const getAllCategories = () => {
    if (!Array.isArray(jewellery)) {
      return categories.filter(cat => cat !== 'All Jewellery' && cat !== 'Custom');
    }
    
    const baseCategories = categories.filter(cat => cat !== 'All Jewellery');
    const customCategories = jewellery
      .map(item => item.category?.main)
      .filter(cat => cat && !baseCategories.includes(cat))
      .filter((cat, index, arr) => arr.indexOf(cat) === index);
    
    return [...baseCategories.filter(cat => cat !== 'Custom'), ...customCategories];
  };

  const getAllSubCategories = () => {
    if (!Array.isArray(jewellery)) {
      return [];
    }
    
    const subCategories = jewellery
      .map(item => item.category?.sub)
      .filter(sub => sub && sub.trim() !== '')
      .filter((sub, index, arr) => arr.indexOf(sub) === index);
    
    return subCategories.sort();
  };

  const getFilteredSubCategories = () => {
    if (!Array.isArray(jewellery)) {
      return [];
    }
    
    if (selectedCategory.length === 0) {
      return getAllSubCategories();
    }
    
    const filteredSubCategories = jewellery
      .filter(item => selectedCategory.includes(item.category?.main))
      .map(item => item.category?.sub)
      .filter(sub => sub && sub.trim() !== '')
      .filter((sub, index, arr) => arr.indexOf(sub) === index);
    
    return filteredSubCategories.sort();
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
  };

  const clearAllSorts = () => {
    setSortField('clickCount');
    setSortOrder('desc');
    setSortByDate('');
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

  // Enhanced media gallery modal
  const openMediaModal = (media, startIndex = 0) => {
    setModalMedia(media);
    setCurrentMediaIndex(startIndex);
  };

  // Close media modal
  const closeMediaModal = () => {
    setModalMedia([]);
    setCurrentMediaIndex(0);
  };

  // Navigate media in modal
  const navigateMedia = (direction) => {
    if (direction === 'next') {
      setCurrentMediaIndex(prev => (prev + 1) % modalMedia.length);
    } else {
      setCurrentMediaIndex(prev => (prev - 1 + modalMedia.length) % modalMedia.length);
    }
  };

  const filterJewellery = () => {
    if (!Array.isArray(jewellery)) {
      console.error('Jewellery is not an array:', jewellery);
      return [];
    }
    
    let filtered = [...jewellery];

    if (selectedCategory.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategory.includes(item.category?.main)
      );
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(
        (item) =>
          item.category?.sub &&
          item.category.sub.toLowerCase() === selectedSubCategory.toLowerCase()
      );
    }

    if (selectedType && selectedType !== 'All') {
      filtered = filtered.filter(
        (item) => item.type && item.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    if (selectedGender) {
      filtered = filtered.filter((item) => item.gender === selectedGender);
    }

    if (metalFilter && metalFilter !== 'All') {
      filtered = filtered.filter(
        (item) => item.metal && item.metal.toLowerCase() === metalFilter.toLowerCase()
      );
    }

    if (stoneFilter === 'with') {
      filtered = filtered.filter((item) => item.stoneWeight != null);
    } else if (stoneFilter === 'without') {
      filtered = filtered.filter((item) => item.stoneWeight == null);
    }

    if (designFilter === 'our') {
      filtered = filtered.filter((item) => item.isOurDesign === true);
    } else if (designFilter === 'Others') {
      filtered = filtered.filter((item) => item.isOurDesign === false);
    }

    if (weightRanges.length > 0) {
      filtered = filtered.filter((item) => {
        const w = parseFloat(item.weight);
        if (isNaN(w)) return false;
        return weightRanges.some((range) => {
          const [min, max] = range.split('-');
          return max === '+'
            ? w >= parseFloat(min)
            : w >= parseFloat(min) && w <= parseFloat(max);
        });
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (searchId) {
      filtered = filtered.filter(
        (item) => item.id?.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    // Sorting logic
    if (sortField === 'orderNo') {
      if (sortOrder === 'asc') {
        filtered.sort((a, b) => {
          const aOrder = a.orderNo !== undefined && a.orderNo !== null ? a.orderNo : 0;
          const bOrder = b.orderNo !== undefined && b.orderNo !== null ? b.orderNo : 0;
          return aOrder - bOrder;
        });
      } else if (sortOrder === 'desc') {
        filtered.sort((a, b) => {
          const aOrder = a.orderNo !== undefined && a.orderNo !== null ? a.orderNo : 0;
          const bOrder = b.orderNo !== undefined && b.orderNo !== null ? b.orderNo : 0;
          return bOrder - aOrder;
        });
      }
    } else if (sortField === 'weight') {
      if (sortOrder === 'asc') {
        filtered.sort((a, b) => {
          const aWeight = parseFloat(a.weight) || 0;
          const bWeight = parseFloat(b.weight) || 0;
          return aWeight - bWeight;
        });
      } else if (sortOrder === 'desc') {
        filtered.sort((a, b) => {
          const aWeight = parseFloat(a.weight) || 0;
          const bWeight = parseFloat(b.weight) || 0;
          return bWeight - aWeight;
        });
      }
    } else if (sortField === 'clickCount') {
      if (sortOrder === 'desc') {
        filtered.sort((a, b) => {
          const aClicks = a.clickCount || 0;
          const bClicks = b.clickCount || 0;
          return bClicks - aClicks;
        });
      } else if (sortOrder === 'asc') {
        filtered.sort((a, b) => {
          const aClicks = a.clickCount || 0;
          const bClicks = b.clickCount || 0;
          return aClicks - bClicks;
        });
      }
    }

    if (sortByDate === 'newest') {
      filtered.sort((a, b) => {
        const aDate = a.date ? new Date(a.date) : new Date(0);
        const bDate = b.date ? new Date(b.date) : new Date(0);
        return bDate - aDate;
      });
    } else if (sortByDate === 'oldest') {
      filtered.sort((a, b) => {
        const aDate = a.date ? new Date(a.date) : new Date(0);
        const bDate = b.date ? new Date(b.date) : new Date(0);
        return aDate - bDate;
      });
    }

    return filtered;
  };

  const filteredJewellery = filterJewellery();

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 min-h-screen">
      {/* Header with Logo and Company Name */}
      <div className="bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-orange-400/90 backdrop-blur-md fixed top-0 left-0 w-full z-[90] shadow-2xl p-4 border-b border-amber-300/50">
        <div className="flex items-center gap-4 justify-center sm:justify-start">
          <div className="relative">
            <img
              src="./logo.png"
              alt="Logo"
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

      {/* Search Bar - Separate Section */}
      <div className="bg-gradient-to-r from-white/95 via-amber-50/95 to-orange-50/95 backdrop-blur-md fixed top-20 sm:top-24 left-0 w-full z-[85] shadow-lg p-4 border-b border-amber-300/50">
        <div className="w-full max-w-2xl mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jewellery by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/30 transition-all duration-300 shadow-lg text-sm sm:text-base font-medium"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Filter and Sort Controls Row */}
      <div className="fixed top-36 sm:top-44 left-0 w-full bg-gradient-to-r from-white/95 via-amber-50/95 to-orange-50/95 backdrop-blur-md border-b-2 border-amber-300/50 shadow-lg z-[80] p-4">
        <div className="flex items-center justify-center gap-2">
          
          {/* Filter By Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterPanel(!showFilterPanel);
                setShowSortPanel(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm sm:text-base">Filter By</span>
              <svg className={`w-3 h-3 sm:w-4 sm:h-4 transform transition-transform duration-300 ${showFilterPanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filter Dropdown Panel */}
            {showFilterPanel && (
              <div className="absolute top-full mt-2 left-0 w-80 sm:w-96 bg-white/95 backdrop-blur-md border-2 border-blue-300 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
                <div className="space-y-4">
                  
                  {/* Category Multi-Select */}
                  <div>
                    <label className="block font-bold text-blue-700 mb-2">Categories</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50">
                      {getAllCategories().map((cat) => (
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
                      {getFilteredSubCategories().map((subCat) => (
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

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-white/50"></div>

          {/* Sort By Dropdown - Fixed Positioning */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortPanel(!showSortPanel);
                setShowFilterPanel(false);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/20"
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
              <span className="text-sm sm:text-base">Sort By</span>
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

            {/* Sort Dropdown Panel - Fixed to match Filter positioning */}
            {showSortPanel && (
              <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white/95 backdrop-blur-md border-2 border-purple-300 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90]">
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
                        setSortOrder("");
                        setSortByDate("");
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="">Select Field...</option>
                      <option value="weight">Weight</option>
                      <option value="orderNo">Order Number</option>
                      <option value="clickCount">Popularity</option>
                    </select>
                  </div>

                  {/* Sort Direction */}
                  {(sortField === "weight" ||
                    sortField === "orderNo" ||
                    sortField === "clickCount") && (
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
                            sortOrder === "asc"
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
                            sortOrder === "desc"
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
                  )}

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

                  {/* Quick Sort Options */}
                  <div>
                    <label className="block font-bold text-purple-700 mb-2">
                      Quick Sort
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSortField("clickCount");
                          setSortOrder("desc");
                          setSortByDate("");
                        }}
                        className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
                      >
                        Most Popular Items
                      </button>
                      <button
                        onClick={() => {
                          setSortField("weight");
                          setSortOrder("desc");
                          setSortByDate("");
                        }}
                        className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
                      >
                        Heaviest Items
                      </button>
                      <button
                        onClick={() => {
                          setSortField("weight");
                          setSortOrder("asc");
                          setSortByDate("");
                        }}
                        className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
                      >
                        Lightest Items
                      </button>
                    </div>
                  </div>

                  {/* Grid Columns - Simplified */}
                  <div>
                    <label className="block font-bold text-purple-700 mb-2">
                      Grid Layout
                    </label>
                    <select
                      value={gridCols}
                      onChange={(e) => setGridCols(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value={1}>1 Column</option>
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                    </select>
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

      {/* Content with proper spacing to avoid overlap */}
      <div className="pt-60 sm:pt-64">
        {/* Enhanced Cards Grid with Simplified Grid Options */}
        <div
          className={`gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 pb-20 ${
            gridCols === 1
              ? 'grid grid-cols-1'
              : gridCols === 2
              ? 'grid grid-cols-1 sm:grid-cols-2'
              : gridCols === 3
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {filteredJewellery.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl sm:text-8xl mb-6 animate-bounce">💎</div>
              <p className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">No jewellery items found.</p>
              <p className="text-gray-500 text-base sm:text-lg">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredJewellery.map((item) => {
              const itemImages = getItemImages(item);
              const itemVideos = getItemVideos(item);
              const mainImage = getMainImage(item);
              
              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className="bg-gradient-to-br from-white via-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 cursor-pointer group overflow-hidden relative"
                >
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Enhanced Media Section with Images and Videos Support */}
                  {mainImage && (
                    <div className="relative mb-4 overflow-hidden rounded-xl sm:rounded-2xl">
                      <img
                        src={mainImage}
                        alt={item.name}
                        className="w-full h-32 sm:h-40 lg:h-48 object-cover border-2 border-amber-200 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Enhanced Media Indicators */}
                      <div className="absolute top-2 left-2 flex gap-1 sm:gap-2">
                        {/* Images Count */}
                        {itemImages.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {itemImages.length}
                          </div>
                        )}
                        
                        {/* Videos Count */}
                        {itemVideos.length > 0 && (
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                            </svg>
                            {itemVideos.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Popularity badge */}
                      {item.clickCount > 0 && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          🔥 {item.clickCount}
                        </div>
                      )}
                      
                      {/* Design Ownership Badge */}
                      <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                        item.isOurDesign === false 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {item.isOurDesign === false ? '👤' : '🏪'}
                      </div>
                    </div>
                  )}
                  
                  <h2 className="text-lg sm:text-xl font-black text-amber-900 mb-3 sm:mb-4 truncate group-hover:text-amber-800 transition-colors duration-300">{item.name}</h2>
                  
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-white/50 rounded-lg sm:rounded-xl">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">⚖️</div>
                      <span className="font-semibold">Weight:</span> 
                      <span className="font-bold text-amber-700">{item.weight}g</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-white/50 rounded-lg sm:rounded-xl">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">🏷️</div>
                      <span className="font-semibold">Category:</span> 
                      <span className="font-bold text-amber-700">{item.category?.main}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 text-center">
                    <span className="text-xs sm:text-sm text-blue-600 font-bold bg-gradient-to-r from-blue-100 to-indigo-100 px-3 sm:px-4 py-2 rounded-full border border-blue-200 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                      Click for details ✨
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Enhanced Item Details Popup with Media Gallery (Images + Videos) - No Admin Actions */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[95] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 sm:border-4 border-amber-400 shadow-2xl">
            {/* Enhanced Popup Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-4 sm:p-6 border-b-2 border-amber-500 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2 sm:gap-4 drop-shadow-lg">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Item Details
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-red-600 hover:text-red-800 bg-white/90 hover:bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Enhanced Popup Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Enhanced Media Gallery Section (Images + Videos) */}
              {(() => {
                const itemMedia = getItemMedia(selectedItem);
                return itemMedia.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    {/* Main Media */}
                    <div className="text-center mb-4">
                      {itemMedia[0].type === 'image' ? (
                        <img
                          src={itemMedia[0].src}
                          alt={selectedItem.name}
                          onClick={() => openMediaModal(itemMedia, 0)}
                          className="max-w-full h-48 sm:h-64 lg:h-80 object-cover rounded-xl sm:rounded-2xl mx-auto cursor-pointer border-2 sm:border-4 border-amber-200 hover:border-amber-400 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                        />
                      ) : (
                        <video
                          src={itemMedia[0].src}
                          controls
                          className="max-w-full h-48 sm:h-64 lg:h-80 object-cover rounded-xl sm:rounded-2xl mx-auto border-2 sm:border-4 border-amber-200 shadow-2xl"
                          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggNUwyMCAxMkw4IDE5VjVaIiBmaWxsPSIjRkY2OTAwIi8+Cjwvc3ZnPgo="
                        />
                      )}
                    </div>
                    
                    {/* Media Thumbnails */}
                    {itemMedia.length > 1 && (
                      <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                        {itemMedia.map((media, index) => (
                          <div
                            key={index}
                            onClick={() => openMediaModal(itemMedia, index)}
                            className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 overflow-hidden"
                          >
                            {media.type === 'image' ? (
                              <img
                                src={media.src}
                                alt={`${selectedItem.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-6 sm:w-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                                </svg>
                              </div>
                            )}
                            {/* Media Type Badge */}
                            <div className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-1 py-0.5 rounded text-xs font-bold ${
                              media.type === 'image' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-purple-500 text-white'
                            }`}>
                              {media.type === 'image' ? '📷' : '🎥'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Media Count */}
                    <div className="text-center mt-4 flex justify-center gap-2 sm:gap-4">
                      {getItemImages(selectedItem).length > 0 && (
                        <span className="text-xs sm:text-sm text-gray-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                          📸 {getItemImages(selectedItem).length} image{getItemImages(selectedItem).length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {getItemVideos(selectedItem).length > 0 && (
                        <span className="text-xs sm:text-sm text-gray-600 bg-purple-100 px-2 sm:px-3 py-1 rounded-full">
                          🎥 {getItemVideos(selectedItem).length} video{getItemVideos(selectedItem).length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Enhanced Item Name */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-900 mb-6 sm:mb-8 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{selectedItem.name}</h3>

              {/* Enhanced Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">🆔</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">ID</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.id}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">✨</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Type</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.type}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">🥇</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Metal</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.metal}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">💎</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Carat</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.carat}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">⚖️</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Weight</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.weight}g</span>
                    </div>
                  </p>
                </div>
                {selectedItem.stoneWeight && (
                  <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">💎</div>
                      <div>
                        <span className="font-bold text-amber-800 block text-sm sm:text-base">Stone</span>
                        <span className="text-base sm:text-lg font-semibold">{selectedItem.stoneWeight}g</span>
                      </div>
                    </p>
                  </div>
                )}
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">🏷️</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Category</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.category?.main}
                        {selectedItem.category?.sub && ` - ${selectedItem.category.sub}`}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">👤</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Gender</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.gender}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">🔥</div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Popularity</span>
                      <span className="text-base sm:text-lg font-semibold">{selectedItem.clickCount || 0} views</span>
                    </div>
                  </p>
                </div>
                {/* Design Ownership Display */}
                <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base ${
                      selectedItem.isOurDesign === false ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {selectedItem.isOurDesign === false ? '👤' : '🏪'}
                    </div>
                    <div>
                      <span className="font-bold text-amber-800 block text-sm sm:text-base">Design</span>
                      <span className="text-base sm:text-lg font-semibold">
                        {selectedItem.isOurDesign === false ? 'Others Design' : 'In House'}
                      </span>
                    </div>
                  </p>
                </div>
                {selectedItem.orderNo !== undefined && selectedItem.orderNo !== null && (
                  <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">📋</div>
                      <div>
                        <span className="font-bold text-amber-800 block text-sm sm:text-base">Order No</span>
                        <span className="text-base sm:text-lg font-semibold">{selectedItem.orderNo}</span>
                      </div>
                    </p>
                  </div>
                )}
                {selectedItem.date && (
                  <div className="bg-gradient-to-r from-white to-amber-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <p className="flex items-center gap-2 sm:gap-3 text-gray-700">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">📅</div>
                      <div>
                        <span className="font-bold text-amber-800 block text-sm sm:text-base">Uploaded</span>
                        <span className="text-base sm:text-lg font-semibold">{new Date(selectedItem.date).toLocaleDateString()}</span>
                      </div>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Media Gallery Modal (Images + Videos) */}
      {modalMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex items-center justify-center">
          <div className="relative max-w-6xl max-h-[90vh] w-full mx-2 sm:mx-4">
            {/* Close Button */}
            <button
              onClick={closeMediaModal}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300 transform hover:scale-110"
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
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main Media */}
            <div className="flex items-center justify-center h-full">
              {modalMedia[currentMediaIndex].type === 'image' ? (
                <img
                  src={modalMedia[currentMediaIndex].src}
                  alt={`Gallery ${currentMediaIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white"
                />
              ) : (
                <video
                  src={modalMedia[currentMediaIndex].src}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white"
                />
              )}
            </div>

            {/* Media Counter and Type */}
            {modalMedia.length > 1 && (
              <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 sm:px-4 py-2 rounded-full flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  modalMedia[currentMediaIndex].type === 'image' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {modalMedia[currentMediaIndex].type === 'image' ? '📷' : '🎥'}
                </span>
                {currentMediaIndex + 1} / {modalMedia.length}
              </div>
            )}

            {/* Thumbnail Navigation */}
            {modalMedia.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 bg-black/30 p-2 sm:p-3 rounded-xl sm:rounded-2xl max-w-full overflow-x-auto">
                {modalMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                      index === currentMediaIndex ? 'border-white scale-110' : 'border-gray-400 hover:border-white'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.src}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCatalogue;