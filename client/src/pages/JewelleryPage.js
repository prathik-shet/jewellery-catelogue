import React, { useEffect, useState } from 'react';
import { getAllJewellery, deleteJewellery } from '../services/jewelleryService';
import JewelleryCard from '../components/JewelleryCard';

const JewelleryPage = () => {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    const res = await getAllJewellery();
    setItems(res.data);
  };

  const handleDelete = async (id) => {
    await deleteJewellery(id);
    fetchItems(); // refresh after delete
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="page-container">
        <h2>Jewellery Catalogue</h2>
        <div className="grid">
    {items.map((item) => (
      <JewelleryCard key={item._id} item={item} onDelete={handleDelete} />
    ))}
  </div>
</div>

  );
};

export default JewelleryPage;
