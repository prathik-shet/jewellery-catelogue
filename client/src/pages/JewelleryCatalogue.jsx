import React, { useEffect, useState } from 'react';
import axios from 'axios';

function JewelleryCatalogue() {
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
  const [newItem, setNewItem] = useState({});
  
  // ✅ Enhanced media file handling
  const [imageFiles, setImageFiles] = useState([]); // Multiple image files
  const [videoFiles, setVideoFiles] = useState([]); // ✅ NEW: Multiple video files
  
  const [isEditing, setIsEditing] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // ✅ Enhanced modal media handling
  const [modalMedia, setModalMedia] = useState([]); // Combined images and videos
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const [gridCols, setGridCols] = useState(3);
  const [sortField, setSortField] = useState('clickCount');
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
  const types = ['All', 'festival', 'lightweight', 'daily wear', 'fancy', 'normal'];
  const metals = ['All', 'gold', 'silver', 'diamond', 'platinum', 'rose gold'];
  const isAdmin = true;

  axios.get(`/api/jewellery`);


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

  // ✅ Enhanced helper function to get all media (images + videos) from an item
  const getItemMedia = (item) => {
    const media = [];
    
    // Add images
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      item.images.forEach(img => media.push({ type: 'image', src: img }));
    } else if (item.image) {
      media.push({ type: 'image', src: item.image });
    }
    
    // ✅ NEW: Add videos
    if (item.videos && Array.isArray(item.videos) && item.videos.length > 0) {
      item.videos.forEach(vid => media.push({ type: 'video', src: vid }));
    }
    
    return media;
  };

  // ✅ Helper function to get all images from an item
  const getItemImages = (item) => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    } else if (item.image) {
      return [item.image];
    }
    return [];
  };

  // ✅ NEW: Helper function to get all videos from an item
  const getItemVideos = (item) => {
    if (item.videos && Array.isArray(item.videos) && item.videos.length > 0) {
      return item.videos;
    }
    return [];
  };

  // ✅ Helper function to get the main image
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

  // ✅ NEW: Get existing sub-categories for the selected main category
  const getSubCategoriesForMainCategory = (mainCategory) => {
    if (!Array.isArray(jewellery) || !mainCategory || mainCategory === 'Custom') {
      return [];
    }
    
    const subCategories = jewellery
      .filter(item => item.category?.main === mainCategory)
      .map(item => item.category?.sub)
      .filter(sub => sub && sub.trim() !== '')
      .filter((sub, index, arr) => arr.indexOf(sub) === index);
    
    return subCategories.sort();
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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'catagories') {
      setNewItem((prev) => ({
        ...prev,
        category: { ...prev.category, main: value, sub: '' }, // ✅ Clear sub when main changes
      }));
      if (value !== 'Custom') setCustomCategory('');
    } else if (name === 'subCategory') {
      setNewItem((prev) => ({
        ...prev,
        category: { ...prev.category, sub: value },
      }));
    } else if (type === 'checkbox') {
      setNewItem((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Enhanced file handling for multiple images
  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('Maximum 10 images allowed per item');
      return;
    }
    setImageFiles(files);
  };

  // ✅ NEW: Enhanced file handling for multiple videos
  const handleVideoFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 videos allowed per item');
      return;
    }
    setVideoFiles(files);
  };

  // ✅ Remove image from upload list
  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ NEW: Remove video from upload list
  const removeVideoFile = (index) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Enhanced handleAddItem with multiple images and videos
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (
      !newItem.id ||
      !newItem.name ||
      !newItem.category?.main ||
      !newItem.weight ||
      !newItem.metal ||
      !newItem.carat
    ) {
      return alert('All required fields must be filled.');
    }

    if (imageFiles.length === 0 && videoFiles.length === 0) {
      return alert('Please add at least one image or video.');
    }

    try {
      // Process images
      const imagePromises = imageFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      // ✅ NEW: Process videos
      const videoPromises = videoFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      const [imageResults, videoResults] = await Promise.all([
        Promise.all(imagePromises),
        Promise.all(videoPromises)
      ]);

      const payload = {
        id: newItem.id.trim(),
        name: newItem.name.trim(),
        category: {
          main: newItem.category.main === 'Custom' ? customCategory.trim() : newItem.category.main.trim(),
          sub: newItem.category.sub?.trim() || '',
        },
        weight: parseFloat(newItem.weight),
        metal: newItem.metal,
        carat: parseInt(newItem.carat),
        gender: newItem.gender || 'Unisex',
        stoneWeight: newItem.stoneWeight ? parseFloat(newItem.stoneWeight) : null,
        images: imageResults, // Multiple images
        videos: videoResults, // ✅ NEW: Multiple videos
        image: imageResults[0] || null, // Main image for backward compatibility
        type: newItem.type || 'normal',
        orderNo: newItem.orderNo ? parseInt(newItem.orderNo) : null,
        isOurDesign: newItem.isOurDesign !== undefined ? newItem.isOurDesign : true,
        clickCount: 0,
      };

      const token = localStorage.getItem('token');
      await axios.post(`/api/jewellery`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchJewellery();
      setNewItem({});
      setImageFiles([]);
      setVideoFiles([]); // ✅ NEW: Clear video files
      setShowForm(false);
      setCustomCategory('');
      setIsEditing(false);
      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item.');
    }
  };

  const handleEdit = (item) => {
    setNewItem(item);
    setShowForm(true);
    setIsEditing(true);
    setSelectedItem(null);
    setImageFiles([]);
    setVideoFiles([]); // ✅ NEW: Clear video files
    if (!categories.includes(item.category?.main)) {
      setCustomCategory(item.category?.main);
      setNewItem((prev) => ({
        ...prev,
        category: { ...prev.category, main: 'Custom' },
      }));
    }
  };

  // ✅ Enhanced handleUpdateItem with multiple images and videos
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: newItem.id,
        name: newItem.name,
        category: {
          main: newItem.category?.main === 'Custom' ? customCategory.trim() : newItem.category?.main?.trim(),
          sub: newItem.category?.sub?.trim() || '',
        },
        weight: parseFloat(newItem.weight),
        metal: newItem.metal,
        carat: parseInt(newItem.carat),
        gender: newItem.gender,
        stoneWeight: newItem.stoneWeight ? parseFloat(newItem.stoneWeight) : null,
        type: newItem.type || 'normal',
        orderNo: newItem.orderNo ? parseInt(newItem.orderNo) : null,
        isOurDesign: newItem.isOurDesign !== undefined ? newItem.isOurDesign : true,
      };

      const token = localStorage.getItem('token');
      
      // Process images if new ones are uploaded
      if (imageFiles.length > 0) {
        const imagePromises = imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });

        const imageResults = await Promise.all(imagePromises);
        payload.images = imageResults;
        payload.image = imageResults[0];
      }

      // ✅ NEW: Process videos if new ones are uploaded
      if (videoFiles.length > 0) {
        const videoPromises = videoFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });

        const videoResults = await Promise.all(videoPromises);
        payload.videos = videoResults;
      }

      await axios.put(`/api/jewellery/${newItem._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      fetchJewellery();
      setIsEditing(false);
      setNewItem({});
      setImageFiles([]);
      setVideoFiles([]); // ✅ NEW: Clear video files
      setShowForm(false);
      setCustomCategory('');
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/jewellery/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchJewellery();
        setSelectedItem(null);
        alert('Item deleted successfully!');
      } catch {
        alert('Error deleting item.');
      }
    }
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

  // ✅ Enhanced media gallery modal
  const openMediaModal = (media, startIndex = 0) => {
    setModalMedia(media);
    setCurrentMediaIndex(startIndex);
  };

  // ✅ Close media modal
  const closeMediaModal = () => {
    setModalMedia([]);
    setCurrentMediaIndex(0);
  };

  // ✅ Navigate media in modal
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
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 min-h-screen pb-20">
      {/* Enhanced Header with Glassmorphism Effect */}
      <div className="bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-orange-400/90 backdrop-blur-md fixed top-0 left-0 w-full z-[80] shadow-2xl p-4 flex items-center gap-4 border-b border-amber-300/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="./logo.png"
              alt="Logo"
              className="w-16 h-16 object-cover rounded-full border-3 border-white shadow-xl ring-4 ring-amber-200/50"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-wide drop-shadow-lg">
              VIMALESHWARA JEWELLERS
            </h1>
            <p className="text-amber-100 text-sm font-medium">Premium Jewellery Collection</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSortPanel(true)}
          className="ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-white/20 backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort & Filter
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </button>
      </div>

      <div className="h-32" />

      {/* Sort Panel Overlay */}
      {showSortPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]" onClick={() => setShowSortPanel(false)} />
      )}

      {/* Enhanced Sorting Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-96 bg-gradient-to-b from-white via-amber-50 to-orange-50 border-r-4 border-amber-400 z-[150] transform transition-all duration-500 ease-out shadow-2xl ${
        showSortPanel ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gradient-to-r from-amber-300 to-orange-300">
            <h2 className="text-3xl font-black text-amber-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              Sort Options
            </h2>
            <button
              onClick={() => setShowSortPanel(false)}
              className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-xl p-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl border-2 border-blue-300 shadow-lg">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Current Sort
            </h3>
            <p className="text-blue-700 font-semibold text-lg mb-4">{getActiveSortDescription()}</p>
            <button
              onClick={clearAllSorts}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
            >
              Reset to Most Popular
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-amber-200 hover:border-amber-300 transition-all duration-300">
              <label className="block font-bold text-amber-700 mb-4 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                Sort By Field
              </label>
              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value);
                  setSortOrder('');
                  setSortByDate('');
                }}
                className="w-full p-4 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-white to-amber-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-inner"
              >
                <option value="">Select Field...</option>
                <option value="weight">💎 Weight</option>
                <option value="orderNo">📋 Order Number</option>
                <option value="clickCount">🔥 Popularity</option>
              </select>
            </div>

            {(sortField === 'weight' || sortField === 'orderNo' || sortField === 'clickCount') && (
              <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
                <label className="block font-bold text-amber-700 mb-4 flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  Sort Direction
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => {
                      setSortOrder('asc');
                      setSortByDate('');
                    }}
                    className={`p-4 rounded-xl border-2 font-semibold transition-all duration-300 text-lg ${
                      sortOrder === 'asc'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-xl transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 shadow-md hover:shadow-lg'
                    }`}
                  >
                    ⬆️ {sortField === 'clickCount' ? 'Least Popular First' : 'Low to High (Ascending)'}
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder('desc');
                      setSortByDate('');
                    }}
                    className={`p-4 rounded-xl border-2 font-semibold transition-all duration-300 text-lg ${
                      sortOrder === 'desc'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-xl transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 shadow-md hover:shadow-lg'
                    }`}
                  >
                    ⬇️ {sortField === 'clickCount' ? 'Most Popular First' : 'High to Low (Descending)'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-6 bg-white rounded-2xl shadow-lg border-2 border-amber-200">
              <label className="block font-bold text-amber-700 mb-4 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Sort By Date
              </label>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    setSortByDate('newest');
                    setSortOrder('');
                    setSortField('');
                  }}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all duration-300 text-lg ${
                    sortByDate === 'newest'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600 shadow-xl transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  🆕 Newest First
                </button>
                <button
                  onClick={() => {
                    setSortByDate('oldest');
                    setSortOrder('');
                    setSortField('');
                  }}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all duration-300 text-lg ${
                    sortByDate === 'oldest'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600 shadow-xl transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  📅 Oldest First
                </button>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 rounded-2xl border-2 border-purple-300 shadow-lg">
              <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Quick Sort
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => {
                    setSortField('clickCount');
                    setSortOrder('desc');
                    setSortByDate('');
                  }}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                >
                  🔥 Most Popular Items
                </button>
                <button
                  onClick={() => {
                    setSortField('weight');
                    setSortOrder('desc');
                    setSortByDate('');
                  }}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                >
                  💎 Heaviest Items
                </button>
                <button
                  onClick={() => {
                    setSortField('weight');
                    setSortOrder('asc');
                    setSortByDate('');
                  }}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                >
                  🪶 Lightest Items
                </button>
                <button
                  onClick={() => {
                    setSortField('orderNo');
                    setSortOrder('asc');
                    setSortByDate('');
                  }}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                >
                  📋 Order: Low to High
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Filters with Proper Z-Index */}
      <div className="flex flex-wrap gap-6 p-8 bg-gradient-to-r from-white/80 via-amber-50/80 to-orange-50/80 backdrop-blur-md border-2 border-amber-300/50 rounded-3xl shadow-2xl mb-8 mx-6 relative z-[60]">

        {/* Category Multi-Select with Higher Z-Index */}
        <div className="relative group">
          <button className="p-4 border-2 border-amber-400 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl cursor-pointer w-64 text-left font-bold text-amber-800 hover:from-amber-200 hover:to-orange-200 transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl transform hover:scale-105">
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                🏷️
              </div>
              Filter Categories
            </span>
            <svg className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute z-[70] hidden group-hover:block bg-white/95 backdrop-blur-md border-2 border-amber-400 rounded-2xl shadow-2xl max-h-72 overflow-y-auto top-full mt-2 w-64 p-4">
            {getAllCategories().map((cat) => (
              <label
                key={cat}
                className="flex items-center text-sm gap-3 text-gray-700 hover:bg-amber-50 p-3 rounded-xl transition-all duration-200 cursor-pointer font-medium"
              >
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
                  className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-amber-500 focus:ring-2"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Sub-Category Filter */}
        <div className="relative z-[60]">
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full p-4 border-2 border-amber-400 rounded-2xl w-64 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
          >
            <option value="">🔍 All Sub-Categories</option>
            {getFilteredSubCategories().map((subCat) => (
              <option key={subCat} value={subCat}>
                {subCat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <select
          className="p-4 border-2 border-amber-400 rounded-2xl w-64 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {types.map((typeOpt, i) => (
            <option key={i} value={typeOpt === 'All' ? '' : typeOpt}>
              {typeOpt === 'All' ? '🎯 All Types' : `✨ ${typeOpt[0].toUpperCase() + typeOpt.slice(1)}`}
            </option>
          ))}
        </select>

        {/* Enhanced Filter Row */}
        <div className="flex gap-4 flex-wrap">
          {/* Gender */}
          <select
            className="p-4 border-2 border-amber-400 rounded-2xl w-48 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            {genders.map((gender, idx) => (
              <option key={idx} value={gender === 'All' ? '' : gender}>
                {gender === 'All' ? '👥 All' : 
                 gender === 'Unisex' ? '⚪ Unisex' : 
                 gender === 'Women' ? '👩 Women' : '👨 Men'}
              </option>
            ))}
          </select>

          {/* Metal Filter */}
          <select
            className="p-4 border-2 border-amber-400 rounded-2xl w-48 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
            value={metalFilter}
            onChange={(e) => setMetalFilter(e.target.value)}
          >
            {metals.map((metal, idx) => (
              <option key={idx} value={metal === 'All' ? '' : metal}>
                {metal === 'All' ? '🥇 All Metals' : 
                 metal === 'gold' ? '🥇 Gold' :
                 metal === 'silver' ? '🥈 Silver' :
                 metal === 'diamond' ? '💎 Diamond' :
                 metal === 'platinum' ? '⚪ Platinum' :
                 metal === 'rose gold' ? '🌹 Rose Gold' : `✨ ${metal[0].toUpperCase() + metal.slice(1)}`}
              </option>
            ))}
          </select>

          {/* Stone Filter */}
          <select
            className="p-4 border-2 border-amber-400 rounded-2xl w-48 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
            value={stoneFilter}
            onChange={(e) => setStoneFilter(e.target.value)}
          >
            <option value="">💎 All Stones</option>
            <option value="with">✨ With Stone</option>
            <option value="without">⚪ Without Stone</option>
          </select>

          {/* Design Ownership Filter */}
          <select
            className="p-4 border-2 border-amber-400 rounded-2xl w-48 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
            value={designFilter}
            onChange={(e) => setDesignFilter(e.target.value)}
          >
            <option value="">🎨 All Designs</option>
            <option value="our">🏪 In House</option>
            <option value="Others">👤 Others Design</option>
          </select>
        </div>

        {/* Weight Range Multi-Checkbox with Higher Z-Index */}
        <div className="relative group">
          <button className="p-4 border-2 border-amber-400 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl cursor-pointer w-64 text-left font-bold text-amber-800 hover:from-amber-200 hover:to-orange-200 transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl transform hover:scale-105">
            <span className="flex items-center gap-3">
              <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                ⚖️
              </div>
              Filter Weight
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute z-[70] hidden group-hover:block bg-white/95 backdrop-blur-md border-2 border-amber-400 rounded-2xl shadow-2xl max-h-72 overflow-y-auto top-full mt-2 w-64 p-4">
            {[
              '0-2', '2-4', '4-6', '6-8', '8-10', '10-15', '15-20', '20-25',
              '25-30', '30-35', '35-40', '40-45', '45-50', '50-75', '75-+'
            ].map((range) => (
              <label
                key={range}
                className="flex items-center text-sm gap-3 text-gray-700 hover:bg-amber-50 p-3 rounded-xl transition-all duration-200 cursor-pointer font-medium"
              >
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
                  className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-amber-500 focus:ring-2"
                />
                <span>{range.replace('-', '–').replace('+', 'g+')}g</span>
              </label>
            ))}
          </div>
        </div>

        {/* Enhanced Search Inputs */}
        <input
          type="text"
          placeholder="🔍 Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-4 border-2 border-amber-400 rounded-2xl w-64 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-medium hover:shadow-xl"
        />

        <input
          type="text"
          placeholder="🆔 Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="p-4 border-2 border-amber-400 rounded-2xl w-64 bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-medium hover:shadow-xl"
        />

        {/* Enhanced Grid Selector */}
        <select
          className="p-4 border-2 border-amber-400 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 shadow-lg font-semibold text-gray-700 hover:shadow-xl"
          value={gridCols}
          onChange={(e) => setGridCols(Number(e.target.value))}
        >
          <option value={2}>🏠 Grid: 2</option>
          <option value={3}>🏠 Grid: 3</option>
          <option value={4}>🏠 Grid: 4</option>
          <option value={6}>🏠 Grid: 6</option>
          <option value={8}>🏠 Grid: 8</option>
          <option value={10}>🏠 Grid: 10</option>
        </select>

        {/* Enhanced Clear All Filters Button */}
        <button
          onClick={clearAllFilters}
          className="px-8 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-red-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Filters
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </button>
      </div>

      {/* Enhanced Add Item Button */}
      {isAdmin && (
        <div className="px-6 mb-8 relative z-0">
          <button
            onClick={() => {
              setShowForm(true);
              setNewItem({});
              setImageFiles([]);
              setVideoFiles([]); // ✅ NEW: Clear video files
              setIsEditing(false);
              setCustomCategory('');
            }}
            className="relative z-0 px-8 py-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold rounded-2xl hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-emerald-400"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            Add New Jewellery
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          </button>
        </div>
      )}

      {/* ✅ Enhanced Cards Grid with Multiple Media (Images + Videos) */}
      <div
        className={`grid gap-8 px-6 pb-20 ${
          gridCols === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : gridCols === 3
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            : gridCols === 4
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : gridCols === 6
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            : gridCols === 8
            ? 'grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8'
            : gridCols === 10
            ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-10'
            : 'grid-cols-1'
        }`}
      >
        {filteredJewellery.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <div className="text-8xl mb-6 animate-bounce">💎</div>
            <p className="text-2xl font-bold text-gray-600 mb-2">No jewellery items found.</p>
            <p className="text-gray-500 text-lg">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filteredJewellery.map((item) => {
            const itemImages = getItemImages(item);
            const itemVideos = getItemVideos(item); // ✅ NEW: Get videos
            //const itemMedia = getItemMedia(item); // ✅ NEW: Get all media
            const mainImage = getMainImage(item);
            
            return (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                className="bg-gradient-to-br from-white via-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 cursor-pointer group overflow-hidden relative"
              >
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* ✅ Enhanced Media Section with Images and Videos Support */}
                {mainImage && (
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={mainImage}
                      alt={item.name}
                      className="w-full h-48 object-cover border-2 border-amber-200 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* ✅ Enhanced Media Indicators */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {/* Images Count */}
                      {itemImages.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {itemImages.length}
                        </div>
                      )}
                      
                      {/* ✅ NEW: Videos Count */}
                      {itemVideos.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                          </svg>
                          {itemVideos.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Popularity badge */}
                    {item.clickCount > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        🔥 {item.clickCount}
                      </div>
                    )}
                    
                    {/* Design Ownership Badge */}
                    <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      item.isOurDesign === false 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    }`}>
                      {item.isOurDesign === false ? '👤 Others' : '🏪 In House'}
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl font-black text-amber-900 mb-4 truncate group-hover:text-amber-800 transition-colors duration-300">{item.name}</h2>
                
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-xl">
                    <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold">⚖️</div>
                    <span className="font-semibold">Weight:</span> 
                    <span className="font-bold text-amber-700">{item.weight}g</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-xl">
                    <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold">🏷️</div>
                    <span className="font-semibold">Category:</span> 
                    <span className="font-bold text-amber-700">{item.category?.main}</span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <span className="text-sm text-blue-600 font-bold bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full border border-blue-200 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                    Click for details ✨
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ✅ Enhanced Item Details Popup with Media Gallery (Images + Videos) */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[85] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4 border-amber-400 shadow-2xl">
            {/* Enhanced Popup Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6 border-b-2 border-amber-500 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-3xl font-black text-white flex items-center gap-4 drop-shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Item Details
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-red-600 hover:text-red-800 bg-white/90 hover:bg-white rounded-2xl p-4 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Enhanced Popup Content */}
            <div className="p-8">
              {/* ✅ Enhanced Media Gallery Section (Images + Videos) */}
              {(() => {
                const itemMedia = getItemMedia(selectedItem);
                return itemMedia.length > 0 && (
                  <div className="mb-8">
                    {/* Main Media */}
                    <div className="text-center mb-4">
                      {itemMedia[0].type === 'image' ? (
                        <img
                          src={itemMedia[0].src}
                          alt={selectedItem.name}
                          onClick={() => openMediaModal(itemMedia, 0)}
                          className="max-w-full h-80 object-cover rounded-2xl mx-auto cursor-pointer border-4 border-amber-200 hover:border-amber-400 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                        />
                      ) : (
                        <video
                          src={itemMedia[0].src}
                          controls
                          className="max-w-full h-80 object-cover rounded-2xl mx-auto border-4 border-amber-200 shadow-2xl"
                          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggNUwyMCAxMkw4IDE5VjVaIiBmaWxsPSIjRkY2OTAwIi8+Cjwvc3ZnPgo="
                        />
                      )}
                    </div>
                    
                    {/* Media Thumbnails */}
                    {itemMedia.length > 1 && (
                      <div className="flex justify-center gap-3 flex-wrap">
                        {itemMedia.map((media, index) => (
                          <div
                            key={index}
                            onClick={() => openMediaModal(itemMedia, index)}
                            className="relative w-20 h-20 rounded-xl cursor-pointer border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 overflow-hidden"
                          >
                            {media.type === 'image' ? (
                              <img
                                src={media.src}
                                alt={`${selectedItem.name} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                                </svg>
                              </div>
                            )}
                            {/* Media Type Badge */}
                            <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-xs font-bold ${
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
                    <div className="text-center mt-4 flex justify-center gap-4">
                      {getItemImages(selectedItem).length > 0 && (
                        <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                          📸 {getItemImages(selectedItem).length} image{getItemImages(selectedItem).length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {getItemVideos(selectedItem).length > 0 && (
                        <span className="text-sm text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
                          🎥 {getItemVideos(selectedItem).length} video{getItemVideos(selectedItem).length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Enhanced Item Name */}
              <h3 className="text-4xl font-black text-amber-900 mb-8 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{selectedItem.name}</h3>

              {/* Enhanced Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">🆔</div>
                    <div>
                      <span className="font-bold text-amber-800 block">ID</span>
                      <span className="text-lg font-semibold">{selectedItem.id}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">✨</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Type</span>
                      <span className="text-lg font-semibold">{selectedItem.type}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">🥇</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Metal</span>
                      <span className="text-lg font-semibold">{selectedItem.metal}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">💎</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Carat</span>
                      <span className="text-lg font-semibold">{selectedItem.carat}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">⚖️</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Weight</span>
                      <span className="text-lg font-semibold">{selectedItem.weight}g</span>
                    </div>
                  </p>
                </div>
                {selectedItem.stoneWeight && (
                  <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <p className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">💎</div>
                      <div>
                        <span className="font-bold text-amber-800 block">Stone</span>
                        <span className="text-lg font-semibold">{selectedItem.stoneWeight}g</span>
                      </div>
                    </p>
                  </div>
                )}
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">🏷️</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Category</span>
                      <span className="text-lg font-semibold">{selectedItem.category?.main}
                        {selectedItem.category?.sub && ` - ${selectedItem.category.sub}`}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">👤</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Gender</span>
                      <span className="text-lg font-semibold">{selectedItem.gender}</span>
                    </div>
                  </p>
                </div>
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-bold">🔥</div>
                    <div>
                      <span className="font-bold text-amber-800 block">Popularity</span>
                      <span className="text-lg font-semibold">{selectedItem.clickCount || 0} views</span>
                    </div>
                  </p>
                </div>
                {/* Design Ownership Display */}
                <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <p className="flex items-center gap-3 text-gray-700">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                      selectedItem.isOurDesign === false ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {selectedItem.isOurDesign === false ? '👤' : '🏪'}
                    </div>
                    <div>
                      <span className="font-bold text-amber-800 block">Design</span>
                      <span className="text-lg font-semibold">
                        {selectedItem.isOurDesign === false ? 'Others Design' : 'In House'}
                      </span>
                    </div>
                  </p>
                </div>
                {selectedItem.orderNo !== undefined && selectedItem.orderNo !== null && (
                  <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <p className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">📋</div>
                      <div>
                        <span className="font-bold text-amber-800 block">Order No</span>
                        <span className="text-lg font-semibold">{selectedItem.orderNo}</span>
                      </div>
                    </p>
                  </div>
                )}
                {selectedItem.date && (
                  <div className="bg-gradient-to-r from-white to-amber-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <p className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">📅</div>
                      <div>
                        <span className="font-bold text-amber-800 block">Uploaded</span>
                        <span className="text-lg font-semibold">{new Date(selectedItem.date).toLocaleDateString()}</span>
                      </div>
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Admin Actions */}
              {isAdmin && (
                <div className="flex gap-6 justify-center">
                  <button
                    onClick={() => handleEdit(selectedItem)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-bold flex items-center gap-3 shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Item
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem._id)}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold flex items-center gap-3 shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced Media Gallery Modal (Images + Videos) */}
      {modalMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex items-center justify-center">
          <div className="relative max-w-6xl max-h-[90vh] w-full mx-4">
            {/* Close Button */}
            <button
              onClick={closeMediaModal}
              className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-300 transform hover:scale-110"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {modalMedia.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white"
                />
              ) : (
                <video
                  src={modalMedia[currentMediaIndex].src}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white"
                />
              )}
            </div>

            {/* Media Counter and Type */}
            {modalMedia.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2">
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
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/30 p-3 rounded-2xl max-w-full overflow-x-auto">
                {modalMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
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
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* ✅ Enhanced Add/Edit Form with Multiple Image and Video Support - FIXED Z-INDEX */}
      {isAdmin && showForm && (
        <div className="fixed top-0 right-0 w-full sm:w-1/2 md:w-1/3 h-full bg-gradient-to-b from-white via-amber-50 to-orange-50 z-[120] shadow-2xl overflow-y-auto p-8 border-l-4 border-amber-400">
          <button
            className="text-red-600 font-bold float-right mb-6 bg-red-100 hover:bg-red-200 px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center gap-2"
            onClick={() => {
              setShowForm(false);
              setNewItem({});
              setImageFiles([]);
              setVideoFiles([]); // ✅ NEW: Clear video files
              setIsEditing(false);
              setCustomCategory('');
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
          <form
            onSubmit={isEditing ? handleUpdateItem : handleAddItem}
            className="space-y-6 mt-16"
          >
            <h2 className="text-3xl font-black text-amber-800 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              {isEditing ? 'Edit Item' : 'Add New Jewellery'}
            </h2>
            
            <input
              name="id"
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              placeholder="🆔 ID*"
              value={newItem.id || ''}
              onChange={handleFormChange}
              required
            />
            <input
              name="name"
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              placeholder="✨ Name*"
              value={newItem.name || ''}
              onChange={handleFormChange}
              required
            />
            <select
              name="catagories"
              value={newItem.category?.main || ''}
              onChange={handleFormChange}
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              required
            >
              <option value="">🏷️ Select Main Category*</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>
            {newItem.category?.main === 'Custom' && (
              <input
                className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
                placeholder="📝 Enter Custom Category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            )}
            
            {/* ✅ NEW: Enhanced Sub-Category with Existing Options */}
            {newItem.category?.main && newItem.category.main !== 'Custom' && (
              <div className="space-y-2">
                <label className="block font-bold text-amber-700 text-sm">
                  🏷️ Sub-Category (select existing or type new)
                </label>
                <select
                  name="subCategory"
                  value={newItem.category?.sub || ''}
                  onChange={handleFormChange}
                  className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
                >
                  <option value="">Select existing sub-category</option>
                  {getSubCategoriesForMainCategory(newItem.category.main).map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
                <input
                  name="subCategory"
                  className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
                  placeholder="Or type new sub-category"
                  value={newItem.category?.sub || ''}
                  onChange={handleFormChange}
                />
              </div>
            )}
            
            <select
              name="type"
              value={newItem.type || ''}
              onChange={handleFormChange}
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              required
            >
              <option value="">✨ Select Type*</option>
              <option value="festival">💒 festival</option>
              <option value="lightweight">🪶 Lightweight</option>
              <option value="daily wear">👕 Daily Wear</option>
              <option value="fancy">✨ Fancy</option>
              <option value="normal">⚪ Normal</option>
            </select>
            <select
              name="metal"
              value={newItem.metal || ''}
              onChange={handleFormChange}
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              required
            >
              <option value="">🥇 Select Metal*</option>
              <option value="gold">🥇 Gold</option>
              <option value="silver">🥈 Silver</option>
              <option value="diamond">💎 Diamond</option>
              <option value="platinum">⚪ Platinum</option>
              <option value="rose gold">🌹 Rose Gold</option>
            </select>
            <select
              name="carat"
              value={newItem.carat || ''}
              onChange={handleFormChange}
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              required
            >
              <option value="">💎 Select Carat*</option>
              <option value="22">22K</option>
              <option value="18">18K</option>
            </select>
            <select
              name="gender"
              value={newItem.gender || ''}
              onChange={handleFormChange}
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              required
            >
              <option value="">👤 Select Gender*</option>
              <option value="Unisex">⚪ Unisex</option>
              <option value="Women">👩 Women</option>
              <option value="Men">👨 Men</option>
            </select>
            <input
              name="stoneWeight"
              type="number"
              step="0.01"
              placeholder="💎 Stone Weight (g)"
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              value={newItem.stoneWeight || ''}
              onChange={handleFormChange}
            />
            <input
              name="weight"
              type="number"
              step="0.01"
              placeholder="⚖️ Weight (g)*"
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              value={newItem.weight || ''}
              onChange={handleFormChange}
              required
            />
            <input
              name="orderNo"
              type="number"
              placeholder="📋 Order No (optional)"
              className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
              value={newItem.orderNo || ''}
              onChange={handleFormChange}
            />
            
            {/* Design Ownership Checkbox */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <input
                type="checkbox"
                name="isOurDesign"
                checked={newItem.isOurDesign !== false}
                onChange={handleFormChange}
                className="w-6 h-6 text-green-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-green-500 focus:ring-2"
              />
              <label className="font-bold text-green-700 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  🏪
                </div>
                In House (uncheck for Others Design)
              </label>
            </div>
            
            {/* ✅ Enhanced Multiple Image Upload */}
            <div className="space-y-4">
              <label className="block font-bold text-amber-700 text-lg">
                📸 Upload Images (Max 10)*
              </label>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                className="w-full border-2 border-amber-300 p-4 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 font-medium text-lg shadow-lg"
                onChange={handleImageFileChange}
              />
              
              {/* Image Preview Section */}
              {imageFiles.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Selected Images ({imageFiles.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? 'Main' : index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* ✅ NEW: Multiple Video Upload */}
            <div className="space-y-4">
              <label className="block font-bold text-purple-700 text-lg">
                🎥 Upload Videos (Max 5)
              </label>
              <input
                type="file"
                name="videos"
                multiple
                accept="video/*"
                className="w-full border-2 border-purple-300 p-4 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 font-medium text-lg shadow-lg"
                onChange={handleVideoFileChange}
              />
              
              {/* Video Preview Section */}
              {videoFiles.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                    </svg>
                    Selected Videos ({videoFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {videoFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.414.414c.187.187.293.442.293.707V13M15 10h-1.586a1 1 0 00-.707.293l-.414.414A1 1 0 0012 11.414V13M9 7h6m0 10v-3M9 17v-3m3-2h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-purple-800 truncate max-w-48">{file.name}</p>
                              <p className="text-sm text-purple-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideoFile(index)}
                            className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-bold py-4 rounded-2xl hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? 'Update Item' : 'Add Item'}
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JewelleryCatalogue;