import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function UserCatalogue() {
  const [jewellery, setJewellery] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortByDate, setSortByDate] = useState('newest');
  const [stoneFilter, setStoneFilter] = useState('');
  const [metalFilter, setMetalFilter] = useState('');
  const [weightMin, setWeightMin] = useState(0);
  const [weightMax, setWeightMax] = useState(200);
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

  const [showSearch, setShowSearch] = useState(false);


  const [modalMedia, setModalMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [sortField, setSortField] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const categories = [
    'Earrings', 'Pendants', 'Rings', 'Mangalsutra', 'Chains',
    'Bracelets', 'Necklace', 'Hara', 'Bangles', 'Silver',
    'Diamond', 'Custom',
  ];
  const genders = ['All', 'Unisex', 'Women', 'Men'];
  const types = ['All', 'Festival', 'Lightweight', 'Daily Wear', 'Fancy', 'Normal'];
  const metals = ['All', 'Gold', 'Silver', 'Diamond', 'Platinum', 'Rose Gold'];

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && gridCols > 2) {
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
        return prev === 1 ? 2 : 1;
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
      return gridCols === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2';
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
      return gridCols === 1 ? 'h-72' : 'h-48';
    } else {
      switch (gridCols) {
        case 2: return 'h-72';
        case 3: return 'h-64';
        case 4: return 'h-56';
        case 6: return 'h-44';
        default: return 'h-56';
      }
    }
  };

  const getTextSizeClasses = () => {
    if (isMobile) {
      return gridCols === 1
        ? { title: 'text-lg', details: 'text-sm' }
        : { title: 'text-sm', details: 'text-xs' };
    } else {
      switch (gridCols) {
        case 2: return { title: 'text-lg', details: 'text-base' };
        case 3: return { title: 'text-base', details: 'text-sm' };
        case 4: return { title: 'text-sm', details: 'text-xs' };
        case 6: return { title: 'text-xs', details: 'text-xs' };
        default: return { title: 'text-sm', details: 'text-xs' };
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
        params.append('sortField', 'createdAt');
        params.append('sortOrder', sortByDate === 'newest' ? 'desc' : 'asc');
      } else if (sortField === 'weight') {
        params.append('sortField', 'weight');
        params.append('sortOrder', sortOrder);
      }

      if (selectedCategory.length > 0) {
        params.append('catagories', selectedCategory.join(','));
      }
      if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
      if (selectedType && selectedType !== 'All') params.append('type', selectedType);
      if (selectedGender && selectedGender !== 'All') params.append('gender', selectedGender);
      if (metalFilter && metalFilter !== 'All') params.append('metal', metalFilter);
      if (stoneFilter) params.append('stone', stoneFilter);
      if (designFilter) params.append('design', designFilter);
      if (weightMin > 0 || weightMax < 200) {
        params.append('weightMin', weightMin.toString());
        params.append('weightMax', weightMax.toString());
      }
      if (searchQuery) params.append('search', searchQuery.trim());
      if (searchId) params.append('searchId', searchId.trim());

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
          total = data.totalItems || data.total || 0;
          pages = data.totalPages || Math.ceil(total / itemsPerPage);
        } else if (data.pagination && data.items) {
          items = data.items;
          total = data.pagination.totalCount;
          pages = data.pagination.totalPages;
        }
      }

      setJewellery(items);
      setTotalItems(total);
      setTotalPages(pages);
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
    metalFilter, stoneFilter, designFilter, weightMin, weightMax,
    searchQuery, searchId,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedType, selectedGender, metalFilter, stoneFilter, designFilter, weightMin, weightMax, searchQuery, searchId, sortField, sortOrder, sortByDate]);

  useEffect(() => {
    fetchJewellery();
  }, [fetchJewellery]);

  const handleItemClick = async (item, index) => {
    setSelectedItem(item);
    setSelectedItemIndex(index);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/jewellery/${item._id}/click`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJewellery(prev => prev.map(jewel =>
        jewel._id === item._id
          ? { ...jewel, clickCount: (jewel.clickCount || 0) + 1 }
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
      if (newIndex >= jewellery.length) newIndex = 0;
    } else if (direction === 'prev') {
      newIndex = selectedItemIndex - 1;
      if (newIndex < 0) newIndex = jewellery.length - 1;
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
    if (distance > 50) navigateToItem('next');
    else if (distance < -50) navigateToItem('prev');
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
    if (item.image) return [item.image];
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
  const CATEGORY_IMAGES = {
  Rings: "https://picsum.photos/seed/rings/300/300",
  Necklace: "https://picsum.photos/seed/Necklace/300/300",
  Mangalsutra: "https://picsum.photos/seed/mangalsutra/300/300",
  Earrings: "https://picsum.photos/seed/earrings/300/300",
  Silver: "https://picsum.photos/seed/Slivers/300/300",
  Bangles: "https://picsum.photos/seed/bangles/300/300",
  Chains: "https://picsum.photos/seed/chains/300/300",
  Pendants: "https://picsum.photos/seed/pendants/300/300",
  "Rings": "https://picsum.photos/seed/finger-rings/300/300",
  "Hara": "https://picsum.photos/seed/necklace-set/300/300",
  "Bracelets": "https://picsum.photos/seed/nose-pin/300/300",
  Diamond: "https://picsum.photos/seed/Diamond/300/300",
};

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

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) range.push(i);
    }

    return range;
  };

  const getFilteredSubcatagories = () => {
    if (selectedCategory.length === 0) {
      return jewellery
        .map(item => item.category?.sub)
        .filter(sub => sub && sub.trim() !== '')
        .filter((sub, index, arr) => arr.indexOf(sub) === index)
        .sort();
    }

    return jewellery
      .filter(item => selectedCategory.includes(item.category?.main))
      .map(item => item.category?.sub)
      .filter(sub => sub && sub.trim() !== '')
      .filter((sub, index, arr) => arr.indexOf(sub) === index)
      .sort();
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedSubCategory('');
    setSelectedType('');
    setSelectedGender('');
    setStoneFilter('');
    setMetalFilter('');
    setWeightMin(0);
    setWeightMax(200);
    setSearchQuery('');
    setSearchId('');
    setDesignFilter('');
    setCurrentPage(1);
  };

  const clearAllSorts = () => {
    setSortField('');
    setSortOrder('desc');
    setSortByDate('');
    setCurrentPage(1);
  };

  const getActiveSortDescription = () => {
    if (sortByDate === 'newest') return 'Date: Newest First';
    if (sortByDate === 'oldest') return 'Date: Oldest First';
    if (sortField === 'weight' && sortOrder === 'asc') return 'Weight: Low to High';
    if (sortField === 'weight' && sortOrder === 'desc') return 'Weight: High to Low';
    return 'Date: Newest First';
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

  const shareOnWhatsApp = () => {
  if (!selectedItem) return;

  const mainImage = getMainImage(selectedItem);
  const imageUrl = mainImage || '';

  const websiteUrl = 'https://jewellery-catelogue.onrender.com/';

  const message =
    `*${selectedItem.name}*\n\n` +
    `*ID:* ${selectedItem.id}\n` +
    `*Category:* ${selectedItem.category?.main}${selectedItem.category?.sub ? ` - ${selectedItem.category.sub}` : ''}\n` +
    `*Type:* ${selectedItem.type}\n` +
    `*Gender:* ${selectedItem.gender}\n` +
    `*Purity:* ${selectedItem.carat || 'N/A'}\n` +
    `*Weight:* ${selectedItem.weight}g\n` +
    `*Stone Weight:* ${selectedItem.stoneWeight || 'N/A'}g\n` +
    `*Design:* ${selectedItem.isOurDesign === false ? 'Others' : 'In House'}\n\n` +
    (imageUrl ? `📸 Image: ${imageUrl}\n\n` : '') +
    `✨ *More designs available*\n` +
    `👉 ${websiteUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};
const enquireOnWhatsApp = () => {
  if (!selectedItem) return;

  const mainImage = getMainImage(selectedItem);
  const imageUrl = mainImage || '';

  const businessNumber = '918088305913'; // country code added
  const websiteUrl = 'https://jewellery-catelogue.onrender.com/';

  const message =
    `👋 *Enquiry for Jewellery*\n\n` +
    `*${selectedItem.name}*\n\n` +
    `*ID:* ${selectedItem.id}\n` +
    `*Category:* ${selectedItem.category?.main}${selectedItem.category?.sub ? ` - ${selectedItem.category.sub}` : ''}\n` +
    `*Type:* ${selectedItem.type}\n` +
    `*Gender:* ${selectedItem.gender}\n` +
    `*Purity:* ${selectedItem.carat || 'N/A'}\n` +
    `*Weight:* ${selectedItem.weight}g\n` +
    `*Stone Weight:* ${selectedItem.stoneWeight || 'N/A'}g\n` +
    `*Design:* ${selectedItem.isOurDesign === false ? 'Others' : 'In House'}\n\n` +
    (imageUrl ? `📸 Image: ${imageUrl}\n\n` : '') +
    `🔗 Catalogue: ${websiteUrl}\n\n` +
    `Please share price and availability.`;

  const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};



  const getGridIcon = () => {
    if (isMobile) {
      return gridCols === 1 ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" />
        </svg>
      );
    } else {
      switch (gridCols) {
        case 2: return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h7M4 12h7M4 18h7M13 6h7M13 12h7M13 18h7" />
          </svg>
        );
        case 3: return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="5" height="5" strokeWidth={2}/>
            <rect x="10" y="3" width="5" height="5" strokeWidth={2}/>
            <rect x="17" y="3" width="5" height="5" strokeWidth={2}/>
          </svg>
        );
        case 4: return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="2" width="4" height="4" strokeWidth={2}/>
            <rect x="8" y="2" width="4" height="4" strokeWidth={2}/>
            <rect x="14" y="2" width="4" height="4" strokeWidth={2}/>
            <rect x="20" y="2" width="4" height="4" strokeWidth={2}/>
          </svg>
        );
        case 6: return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="1" y="2" width="3" height="3" strokeWidth={2}/>
            <rect x="5" y="2" width="3" height="3" strokeWidth={2}/>
            <rect x="9" y="2" width="3" height="3" strokeWidth={2}/>
            <rect x="13" y="2" width="3" height="3" strokeWidth={2}/>
            <rect x="17" y="2" width="3" height="3" strokeWidth={2}/>
            <rect x="21" y="2" width="3" height="3" strokeWidth={2}/>
          </svg>
        );
        default: return null;
      }
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setSelectedSubCategory('');
  };

  return (
    <div style={{ backgroundColor: '#fff8e6' }} className="min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        .brand-font { font-family: 'Playfair Display', serif; }

        .smooth-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-4px); }
        .hover-scale:hover { transform: scale(1.02); }

        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.95);
        }

        .gradient-gold {
          background: linear-gradient(135deg, #efb20c 0%, #fae382 100%);
        }

        .gradient-maroon {
          background: linear-gradient(135deg, #7f1a2b 0%, #a52438 100%);
        }

        .shadow-soft {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .shadow-hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full z-[90] shadow-xl p-4 bg-[#f9faf7] text-[#2e2e2e]">

        <div className="flex items-center gap-4 justify-center sm:justify-start max-w-7xl mx-auto">
          <div className="relative">
            <img
              src="https://vimaleshwara-gold-images.s3.ap-south-1.amazonaws.com/desings/logo.png"
              alt="Logo"
              loading="lazy"
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-4 border-white shadow-2xl smooth-transition hover-scale"
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 style={{ color: '#2e2e2e' }} className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wide brand-font drop-shadow-sm">
              VIMALESHWARA JEWELLERS
            </h1>
            <p style={{ color: '#7f1a2b' }} className="text-xs sm:text-sm font-semibold tracking-wider">Premium Jewellery Collection</p>
          </div>
        </div>
      </div>
      
      {/* ================= FIXED HEADER ================= */}
<div
  className="glass-effect fixed top-20 sm:top-24 left-0 w-full z-[85] shadow-lg p-3 border-b"
  style={{ borderColor: "#efb20c" }}
>
  <div className="w-full max-w-7xl mx-auto relative">

    {/* ================= CATEGORY SLIDER ================= */}
    <div className="overflow-x-auto sm:overflow-x-hidden no-scrollbar mb-3">
      <div className="flex gap-4 px-1 sm:justify-center">
        {categories.map((cat) => {
          const imageSrc =
            CATEGORY_IMAGES[cat] ||
            "https://picsum.photos/seed/default/300/300";

          const isActive = selectedCategory.includes(cat);

          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="flex flex-col items-center min-w-[70px]"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border
                  ${isActive ? "border-amber-400" : "border-gray-300"}`}
              >
                <img
                  src={imageSrc}
                  alt={cat}
                  loading="lazy"
                  className="w-full h-full object-cover bg-gray-100"
                />
              </div>
              <span
                className={`mt-1.5 text-xs sm:text-sm font-medium
                  ${isActive ? "text-amber-600" : "text-gray-700"}`}
              >
                {cat}
              </span>
            </button>
          );
        })}
      </div>
    </div>

    {/* ================= CONTROL STRIP ================= */}
    <div className="flex items-center justify-center gap-2 mb-2 border rounded-xl px-3 py-2 bg-white shadow-sm">

      {/* ================= FILTER ================= */}
      <div className="relative">
        <button
          onClick={() => {
            setShowFilterPanel(!showFilterPanel);
            setShowSortPanel(false);
            setShowSearch(false);
          }}
          className="px-4 py-1.5 rounded-full border text-sm border-[#7f1a2b] text-[#7f1a2b]"
        >
          Filter
        </button>

        {showFilterPanel && (
          <div
            className="absolute top-full mt-2 left-0 w-80 sm:w-96 bg-white border-2 rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto z-[90] fade-in"
            style={{ borderColor: "#7f1a2b" }}
          >
            <div className="space-y-5">

              {/* ❌ CATEGORY REMOVED FROM HERE */}

              <div>
                <label className="block font-bold mb-2" style={{ color: "#7f1a2b" }}>
                  Sub-Category
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl"
                >
                  <option value="">All Sub-Categories</option>
                  {getFilteredSubcatagories().map((sub) => (
                    <option key={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2" style={{ color: "#7f1a2b" }}>
                  Occasion
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl"
                >
                  {types.map((t) => (
                    <option key={t} value={t === "All" ? "" : t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2" style={{ color: "#7f1a2b" }}>
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl"
                >
                  {genders.map((g) => (
                    <option key={g} value={g === "All" ? "" : g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2" style={{ color: "#7f1a2b" }}>
                  Metal
                </label>
                <select
                  value={metalFilter}
                  onChange={(e) => setMetalFilter(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl"
                >
                  {metals.map((m) => (
                    <option key={m} value={m === "All" ? "" : m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2" style={{ color: "#7f1a2b" }}>
                  Design Ownership
                </label>
                <select
                  value={designFilter}
                  onChange={(e) => setDesignFilter(e.target.value)}
                  className="w-full p-3 border-2 rounded-xl"
                >
                  <option value="">All</option>
                  <option value="our">In House</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              
                    <div>
                      <label className="block font-bold mb-3 text-base" style={{ color: '#7f1a2b' }}>
                        Weight Range (grams)
                      </label>
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border-2 border-amber-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Weight</label>
                            <input
                              type="number"
                              min="0"
                              max={weightMax - 1}
                              value={weightMin}
                              onChange={(e) => setWeightMin(Math.max(0, Math.min(Number(e.target.value), weightMax - 1)))}
                              className="w-full p-2.5 border-2 border-gray-300 rounded-lg text-center font-bold smooth-transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                              style={{ color: '#7f1a2b' }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Weight</label>
                            <input
                              type="number"
                              min={weightMin + 1}
                              max="200"
                              value={weightMax}
                              onChange={(e) => setWeightMax(Math.max(weightMin + 1, Math.min(200, Number(e.target.value))))}
                              className="w-full p-2.5 border-2 border-gray-300 rounded-lg text-center font-bold smooth-transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                              style={{ color: '#7f1a2b' }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <span className="inline-block px-4 py-1.5 bg-white rounded-full text-sm font-bold shadow-sm" style={{ color: '#efb20c' }}>
                            {weightMin}g - {weightMax}g
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-2 text-base" style={{ color: '#7f1a2b' }}>Search by ID</label>
                      <input
                        type="text"
                        placeholder="Enter exact ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl smooth-transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                      />
                    </div>

              <button
                onClick={clearAllFilters}
                className="gradient-maroon w-full py-3 text-white font-bold rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= SORT ================= */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSortPanel(!showSortPanel);
            setShowFilterPanel(false);
            setShowSearch(false);
          }}
          className="px-4 py-1.5 rounded-full border text-sm border-amber-500 text-amber-600"
        >
          Sort
        </button>

        {showSortPanel && (
  <div
    className="
      fixed inset-0 z-[100] flex items-center justify-center
      sm:absolute sm:inset-auto sm:top-full sm:right-0
    "
  >
    <div
      className="bg-white w-[90%] sm:w-96 rounded-2xl p-6 shadow-2xl
                 max-h-[80vh] overflow-y-auto fade-in"
      style={{ borderColor: '#efb20c' }}
    >
      <div className="space-y-5">

        {/* ACTIVE SORT INFO */}
        <div
          className="p-4 rounded-xl border-2 shadow-sm"
          style={{ backgroundColor: '#fff8e6', borderColor: '#efb20c' }}
        >
          <p className="font-bold text-center text-base" style={{ color: '#7f1a2b' }}>
            {getActiveSortDescription()}
          </p>
        </div>

        {/* SORT BY DATE */}
        <div>
          <label className="block font-bold mb-3 text-base" style={{ color: '#7f1a2b' }}>
            Sort by Date
          </label>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSortByDate('newest');
                setSortField('');
              }}
              className={`w-full p-3.5 rounded-xl border-2 font-bold smooth-transition ${
                sortByDate === 'newest'
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={sortByDate === 'newest'
                ? { backgroundColor: '#efb20c', borderColor: '#efb20c' }
                : {}}
            >
              Newest First
            </button>

            <button
              onClick={() => {
                setSortByDate('oldest');
                setSortField('');
              }}
              className={`w-full p-3.5 rounded-xl border-2 font-bold smooth-transition ${
                sortByDate === 'oldest'
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={sortByDate === 'oldest'
                ? { backgroundColor: '#efb20c', borderColor: '#efb20c' }
                : {}}
            >
              Oldest First
            </button>
          </div>
        </div>

        {/* SORT BY WEIGHT */}
        <div>
          <label className="block font-bold mb-3 text-base" style={{ color: '#7f1a2b' }}>
            Sort by Weight
          </label>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSortField('weight');
                setSortOrder('desc');
                setSortByDate('');
              }}
              className={`w-full p-3.5 rounded-xl border-2 font-bold smooth-transition ${
                sortField === 'weight' && sortOrder === 'desc'
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={sortField === 'weight' && sortOrder === 'desc'
                ? { backgroundColor: '#efb20c', borderColor: '#efb20c' }
                : {}}
            >
              High to Low
            </button>

            <button
              onClick={() => {
                setSortField('weight');
                setSortOrder('asc');
                setSortByDate('');
              }}
              className={`w-full p-3.5 rounded-xl border-2 font-bold smooth-transition ${
                sortField === 'weight' && sortOrder === 'asc'
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              style={sortField === 'weight' && sortOrder === 'asc'
                ? { backgroundColor: '#efb20c', borderColor: '#efb20c' }
                : {}}
            >
              Low to High
            </button>
          </div>
        </div>

        {/* RESET */}
        <button
          onClick={clearAllSorts}
          className="gradient-maroon w-full px-4 py-3 text-white font-bold rounded-xl hover:shadow-lg smooth-transition"
        >
          Reset Sort
        </button>

      </div>
    </div>
  </div>
)}

      </div>

      {/* SEARCH */}
      <button
        onClick={() => {
          setShowSearch(!showSearch);
          setShowFilterPanel(false);
          setShowSortPanel(false);
        }}
        className="px-3 py-1.5 rounded-full border text-sm"
      >
        🔍
      </button>

      {/* GRID */}
      <button
        onClick={cycleGrid}
        className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs sm:text-[11px]"
      >
        {getGridIcon()}
        <span className="hidden sm:inline ml-1 font-semibold">{gridCols}</span>
      </button>
    </div>

    {/* ================= SEARCH DROPDOWN (OLD STYLE) ================= */}
    {showSearch && (
      <div className="absolute left-0 right-0 top-full mt-3 z-[90] fade-in">
        <div className="w-full max-w-3xl mx-auto px-3">
          <div className="relative bg-white rounded-2xl shadow-xl border">
            <input
              type="text"
              placeholder="Search jewellery by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border-0 rounded-2xl focus:outline-none"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

{/* ================= BACKDROP ================= */}
{(showFilterPanel || showSortPanel || showSearch) && (
  <div
    className="fixed inset-0 z-[70] bg-black/20"
    onClick={() => {
      setShowFilterPanel(false);
      setShowSortPanel(false);
      setShowSearch(false);
    }}
  />
)}






      <div className="pt-60 sm:pt-64">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center fade-in">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4" style={{ borderColor: '#efb20c', borderTopColor: 'transparent' }}></div>
              <p className="text-lg font-semibold" style={{ color: '#7f1a2b' }}>Loading jewellery...</p>
            </div>
          </div>
        )}

        


        <div className={`gap-4 sm:gap-5 lg:gap-6 px-4 sm:px-6 pb-8 max-w-7xl mx-auto ${getGridClasses()}`}>
          {!loading && jewellery.length === 0 ? (
            <div className="col-span-full text-center py-20 fade-in">
              <div className="text-6xl sm:text-8xl mb-6">💎</div>
              <p className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">No jewellery items found.</p>
              <button
                onClick={clearAllFilters}
                className="gradient-gold mt-6 px-8 py-3.5 text-white font-bold rounded-xl hover:shadow-lg smooth-transition hover-lift"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            jewellery.map((item, index) => {
              const mainImage = getMainImage(item);
              const textSizes = getTextSizeClasses();

              return (
  <div
    key={item._id}
    onClick={() => handleItemClick(item, index)}
    className="
      bg-white
      p-2.5 sm:p-3
      smooth-transition
      cursor-pointer
      group
    "
  >
    {mainImage && (
      <div className="mb-3">
        {/* Fixed-size image container */}
        <div className="w-full h-[220px] sm:h-[240px] overflow-hidden rounded-lg bg-white">
          <img
            src={mainImage}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover smooth-transition group-hover:scale-105"
          />
          </div>

    {/* Minimal flat overlay label */}
    <span
      className="absolute bottom-2 left-2 text-xs font-semibold tracking-wide text-white"
      style={{
        background: "rgba(0,0,0,0.55)",
        padding: "4px 8px"
      }}
    >
      
    </span>
  </div>
)}



                  <div className="space-y-1.5">
                    <h2 className={`font-bold truncate ${textSizes.title}`} style={{ color: '#2e2e2e' }}>
                      {item.name}
                    </h2>
                    <div className={`flex items-center justify-between text-gray-600 ${textSizes.details}`}>
                      <span className="font-bold" style={{ color: '#efb20c' }}>{item.weight}g</span>
                      <span className="font-semibold truncate ml-1">{item.category?.main}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {isDataFetched && totalItems > 0 && (
  <div className="px-4 sm:px-6 mb-6 fade-in">
    <div className="bg-[#f9faf7] rounded-2xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.08)] max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div>
          <p className="text-lg font-bold text-[#7f1a2b]">
            Showing {jewellery.length} of {totalItems} items
          </p>

          {totalPages > 1 && (
            <p className="text-sm text-gray-600 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        <div className="text-sm font-semibold text-gray-700 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5 rounded-xl shadow-sm">
          {getActiveSortDescription()}
        </div>

      </div>
    </div>
  </div>
)}
        {isDataFetched && totalPages > 1 && jewellery.length > 0 && (
          <div className="px-4 sm:px-6 pb-8 mt-8 max-w-7xl mx-auto">
            <div className="bg-white/95 rounded-2xl p-6 border-2 shadow-2xl" style={{ borderColor: '#efb20c' }}>
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-bold mb-2" style={{ color: '#7f1a2b' }}>
                    Page {currentPage} of {totalPages}
                  </p>
                  <p className="text-sm text-gray-600">
                    {totalItems} total items
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-5 py-2.5 rounded-xl font-bold smooth-transition ${
                      currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'gradient-maroon text-white hover:shadow-lg hover-scale'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {getPaginationRange().map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-11 h-11 rounded-xl font-bold smooth-transition hover-scale ${
                          page === currentPage ? 'text-white shadow-md' : 'bg-white text-gray-700 border-2 hover:border-amber-400'
                        }`}
                        style={page === currentPage ? { backgroundColor: '#efb20c' } : { borderColor: '#efb20c' }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2.5 rounded-xl font-bold smooth-transition ${
                      currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'gradient-maroon text-white hover:shadow-lg hover-scale'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- 1. MAIN PRODUCT DETAIL MODAL --- */}
{selectedItem && (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] flex items-center justify-center p-4 fade-in"
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
  >
    <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[88vh] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.22)] flex flex-col relative">

      {/* HEADER – CLEAN WHITE */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateToItem('prev')}
            className="px-2 py-1 rounded hover:bg-gray-100 transition"
          >
            ◀
          </button>

          <h2 className="text-base font-semibold truncate max-w-md text-[#2e2e2e]">
            {selectedItem.name}
          </h2>

          <button
            onClick={() => navigateToItem('next')}
            className="px-2 py-1 rounded hover:bg-gray-100 transition"
          >
            ▶
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedItem(null);
            setSelectedItemIndex(-1);
          }}
          className="px-2 py-1 rounded hover:bg-gray-100 transition text-gray-800 font-bold"
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* LEFT – IMAGE */}
        <div className="lg:w-3/5 bg-gray-50 px-4 py-6 flex flex-col items-center justify-center">
          {(() => {
            const itemMedia = getItemMedia(selectedItem);
            const mainImage = getMainImage(selectedItem);
            if (!mainImage) return null;

            return (
              <>
                <div className="relative group w-full flex justify-center items-center flex-1">
                  <img
                    src={mainImage}
                    alt={selectedItem.name}
                    onClick={() => openMediaModal(itemMedia, 0)}
                    className="max-h-[350px] w-auto object-contain rounded-xl bg-white shadow-sm cursor-zoom-in hover:opacity-95 transition-all duration-300"
                  />

                  <div className="absolute bottom-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Tap to expand 🔍
                  </div>
                </div>

                {/* THUMBNAILS */}
                {itemMedia.length > 1 && (
                  <div className="mt-6 flex gap-3 flex-wrap justify-center">
                    {itemMedia.slice(1, 6).map((media, index) => (
                      <div
                        key={index}
                        onClick={() => openMediaModal(itemMedia, index + 1)}
                        className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-sm bg-white"
                      >
                        {media.type === 'image' ? (
                          <img
                            src={media.src}
                            className="w-full h-full object-cover"
                            alt="thumbnail"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs">
                            ▶
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* RIGHT – DETAILS */}
        <div className="lg:w-2/5 px-6 py-6 overflow-y-auto bg-[#fff8e6]">
          <div className="grid grid-cols-2 gap-4 text-sm">

            {/* PRODUCT ID */}
            <div className="col-span-2 bg-white rounded-xl px-4 py-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                Product ID
              </div>
              <div className="text-lg font-bold text-[#7f1a2b]">
                {selectedItem.id}
              </div>
            </div>

            {[
              ['Category', `${selectedItem.category?.main}${selectedItem.category?.sub ? ` - ${selectedItem.category.sub}` : ''}`],
              ['Type', selectedItem.type],
              ['Gender', selectedItem.gender],
              ['Purity', selectedItem.carat || 'N/A'],
              ['Weight', `${selectedItem.weight}g`],
              ['Stone Weight', `${selectedItem.stoneWeight || 'N/A'}g`],
              ['Design', selectedItem.isOurDesign === false ? 'Others' : 'In House'],
            ].map(([label, value], i) => (
              <div
                key={i}
                className="bg-white rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                  {label}
                </div>
                <div className="text-sm font-bold text-[#7f1a2b] mt-0.5">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white px-4 py-3 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]">
        <button
          onClick={enquireOnWhatsApp}
          className="px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 hover:opacity-90 transition active:scale-95"
          style={{ backgroundColor: '#128C7E' }}
        >
          💬 Enquire
        </button>

        <button
          onClick={shareOnWhatsApp}
          className="px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 hover:opacity-90 transition active:scale-95"
          style={{ backgroundColor: '#25D366' }}
        >
          🔗 Share
        </button>
      </div>
    </div>
  </div>
)}

{/* LIGHTBOX MEDIA VIEWER – BORDERLESS */}
{modalMedia.length > 0 && (
  <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center backdrop-blur-md animate-fade-in">
    <div className="relative w-full h-full flex items-center justify-center p-4">

      {/* CLOSE */}
      <button
        onClick={closeMediaModal}
        className="absolute top-6 right-6 z-50 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 backdrop-blur-sm transition-all hover:scale-110"
      >
        ✕
      </button>

      {/* NAVIGATION */}
      {modalMedia.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); navigateMedia('prev'); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-4 transition hover:scale-110"
          >
            ◀
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateMedia('next'); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-4 transition hover:scale-110"
          >
            ▶
          </button>
        </>
      )}

      {/* MEDIA */}
      <div className="w-full h-full flex items-center justify-center">
        {modalMedia[currentMediaIndex].type === 'image' ? (
          <img
            src={modalMedia[currentMediaIndex].src}
            alt=""
            className="max-w-full max-h-[85vh] object-contain"
          />
        ) : (
          <video
            src={modalMedia[currentMediaIndex].src}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] object-contain"
          />
        )}
      </div>

      {/* COUNTER */}
      {modalMedia.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white px-6 py-2 rounded-full text-sm">
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