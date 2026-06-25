import React from 'react';
import { useCart } from '../context/CartContext';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';

const FoodCard = ({ food }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(food, 1, 'Food');
  };

  const getBackendUrl = (url) => {
    if (!url) return '';
    // If it's an external url, return it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Return relative URL which Vite proxies
    return url;
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover border border-light-gray/20 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5">
      {/* Food Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={getBackendUrl(food.image)}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Availability Badge */}
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-dark-darker/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="flex items-center space-x-1 bg-primary text-white text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>Sold Out</span>
            </span>
          </div>
        )}

        {/* Category Label */}
        {food.category && (
          <span className="absolute top-4 left-4 bg-secondary text-dark-darker text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {food.category.name}
          </span>
        )}
      </div>

      {/* Details Container */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors line-clamp-1">
          {food.name}
        </h3>
        
        <p className="text-gray-500 text-xs mt-2 mb-4 leading-relaxed flex-grow line-clamp-2">
          {food.description || 'No description available for this item.'}
        </p>

        {/* Action Bottom Row */}
        <div className="flex items-center justify-between pt-3 border-t border-light-gray/20 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</span>
            <span className="text-xl font-extrabold text-dark">
              Rs. {food.price.toLocaleString()}
            </span>
          </div>

          {food.isAvailable ? (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95"
              title="Add to Cart"
            >
              <FiPlus className="w-6 h-6" />
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-200 text-gray-400 cursor-not-allowed"
              title="Out of stock"
            >
              <FiPlus className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
