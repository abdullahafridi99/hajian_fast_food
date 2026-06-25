import React from 'react';
import { useCart } from '../context/CartContext';
import { FiPlus, FiCalendar, FiGift } from 'react-icons/fi';

const DealCard = ({ deal }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(deal, 1, 'Deal');
  };

  const getBackendUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return url;
  };

  const saving = deal.originalPrice - deal.discountPrice;
  const isExpired = new Date(deal.endDate) < new Date();

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover border border-light-gray/20 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5 relative">
      
      {/* Savings Highlight Badge */}
      {saving > 0 && !isExpired && (
        <span className="absolute top-4 right-4 z-10 bg-accent text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow flex items-center space-x-1">
          <FiGift className="w-3.5 h-3.5" />
          <span>Save Rs. {saving}</span>
        </span>
      )}

      {/* Deal Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={getBackendUrl(deal.image)}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {isExpired && (
          <div className="absolute inset-0 bg-dark-darker/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-primary text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider shadow">
              Expired Offer
            </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-extrabold text-dark group-hover:text-primary transition-colors line-clamp-1">
          {deal.title}
        </h3>
        
        <p className="text-gray-500 text-xs mt-2 mb-4 leading-relaxed flex-grow line-clamp-3">
          {deal.description}
        </p>

        {/* Date Row */}
        <div className="flex items-center space-x-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">
          <FiCalendar className="w-3.5 h-3.5 text-primary" />
          <span>
            Ends: {new Date(deal.endDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-light-gray/20 mt-auto">
          <div className="flex items-baseline space-x-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deal Price</span>
              <span className="text-2xl font-black text-primary">
                Rs. {deal.discountPrice.toLocaleString()}
              </span>
            </div>
            
            {deal.originalPrice > deal.discountPrice && (
              <span className="text-sm font-semibold text-gray-400 line-through">
                Rs. {deal.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {!isExpired && deal.isActive ? (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-primary text-white hover:bg-secondary hover:text-dark-darker shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 text-xs font-extrabold uppercase tracking-wider"
              title="Add Deal to Cart"
            >
              <FiPlus className="w-4 h-4" />
              <span>Claim Deal</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gray-200 text-gray-400 cursor-not-allowed text-xs font-extrabold uppercase tracking-wider"
            >
              <span>Unavailable</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealCard;
