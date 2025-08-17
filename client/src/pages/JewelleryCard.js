import React from 'react';

const JewelleryCard = ({ item, onDelete }) => {
  return (
    <div className="card">
      <h3>{item.name}</h3>
      <p>Category: {item.category}</p>
      <p>Price: ₹{item.price}</p>
      <button onClick={() => onDelete(item._id)}>Delete</button>
    </div>
  );
};

export default JewelleryCard;
