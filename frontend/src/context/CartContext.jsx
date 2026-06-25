import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('hajianCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
  }, []);

  // Save cart to localStorage when changed
  useEffect(() => {
    localStorage.setItem('hajianCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, quantity = 1, itemType = 'Food') => {
    setCartItems((prevItems) => {
      const exists = prevItems.find(
        (i) => i.itemId === item._id && i.itemType === itemType
      );

      if (exists) {
        return prevItems.map((i) =>
          i.itemId === item._id && i.itemType === itemType
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      // Prepare cart item structure matching the Order schema
      return [
        ...prevItems,
        {
          itemId: item._id,
          name: item.name || item.title, // 'name' for food, 'title' for deals
          price: item.price || item.discountPrice, // 'price' for food, 'discountPrice' for deals
          image: item.image,
          quantity,
          itemType,
        },
      ];
    });
  };

  const removeFromCart = (itemId, itemType = 'Food') => {
    setCartItems((prevItems) =>
      prevItems.filter((i) => !(i.itemId === itemId && i.itemType === itemType))
    );
  };

  const updateQuantity = (itemId, itemType = 'Food', quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, itemType);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) =>
        i.itemId === itemId && i.itemType === itemType ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
