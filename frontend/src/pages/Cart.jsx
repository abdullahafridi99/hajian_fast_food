import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { customerToken, setShowLoginModal } = useAuth();
  const navigate = useNavigate();

  // Delivery policy: free delivery for orders above Rs. 1000, else Rs. 100

  const deliveryCharge = cartItems.length > 0 && cartTotal >= 1000 ? 0 : (cartItems.length > 0 ? 100 : 0);
  const grandTotal = cartTotal + deliveryCharge;

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Title */}
      <section className="pb-6 border-b border-light-gray/20">
        <span className="bg-primary/10 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
          🛒 Your Choices
        </span>
        <h1 className="text-4xl font-black text-dark mt-3">Shopping Cart</h1>
        <p className="text-gray-500 text-sm mt-1">Review the food items and deals you have selected.</p>
      </section>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <section className="text-center py-20 bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary animate-bounce">
            <FiShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-dark font-extrabold">Your cart is empty</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Looks like you haven't added anything to your cart yet. Head back to our menu to find something delicious!
            </p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center space-x-2 py-3.5 px-8 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark font-extrabold uppercase text-xs tracking-wider transition-all shadow-md"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Go to Menu</span>
          </Link>
        </section>
      ) : (
        /* Active Cart State */
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={`${item.itemId}-${item.itemType}`}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-light-gray/20 shadow-premium flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
              >
                {/* Image & Text */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl flex-shrink-0 border border-light-gray/20"
                  />
                  <div>
                    <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 ${
                      item.itemType === 'Deal' ? 'bg-accent text-white' : 'bg-secondary text-dark'
                    }`}>
                      {item.itemType}
                    </span>
                    <h3 className="font-extrabold text-dark text-base sm:text-lg line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-primary font-bold text-xs">
                      Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Controls and Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-light-gray/20">
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-light-gray/50 rounded-xl bg-light overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.itemId, item.itemType, item.quantity - 1)}
                      className="p-2 hover:bg-gray-200 transition-colors text-dark/70"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 font-bold text-sm text-dark">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.itemId, item.itemType, item.quantity + 1)}
                      className="p-2 hover:bg-gray-200 transition-colors text-dark/70"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total item amount */}
                  <div className="text-right flex flex-col justify-center min-w-[80px]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subtotal</span>
                    <span className="font-extrabold text-dark text-sm sm:text-base">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.itemId, item.itemType)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
                    title="Remove item"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/menu"
              className="inline-flex items-center space-x-2 text-xs font-bold text-primary hover:underline hover:text-primary-dark pt-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Continue Shopping / Add more items</span>
            </Link>
          </div>

          {/* Checkout Summary Panel */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-6">
            <h3 className="text-xl font-bold text-dark border-b border-light-gray/20 pb-4">
              Order Summary
            </h3>

            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-dark font-extrabold text-sm">Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-dark font-extrabold text-sm">
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-black">Free Delivery</span>
                  ) : (
                    `Rs. ${deliveryCharge}`
                  )}
                </span>
              </div>
              
              {deliveryCharge > 0 && (
                <div className="p-3 bg-secondary/15 rounded-xl border border-secondary/30 text-[10px] text-secondary-dark lowercase leading-relaxed">
                  💡 Add items worth <b>Rs. {(1000 - cartTotal).toLocaleString()}</b> more to get <b>Free Delivery</b>!
                </div>
              )}

              <hr className="border-light-gray/20" />

              <div className="flex justify-between text-dark pt-2">
                <span className="text-sm font-black">Grand Total</span>
                <span className="text-xl font-black text-primary">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!customerToken) {
                  setShowLoginModal(true);
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
            </button>

          </div>

        </section>
      )}

    </div>
  );
};

export default Cart;
