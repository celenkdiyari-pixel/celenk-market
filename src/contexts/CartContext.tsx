'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  attributes: {
    [key: string]: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  images: string[];
  variants?: ProductVariant[];
  createdAt?: string;
}

interface CartItem extends Product {
  quantity: number;
  variantId?: string;
  variantName?: string;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  favorites: string[];
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isInCart: (productId: string, variantId?: string) => boolean;
  isFavorite: (productId: string) => boolean;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;
    
    const savedCart = localStorage.getItem('celenk-cart');
    const savedFavorites = localStorage.getItem('celenk-favorites');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure it's an array
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.warn('Cart data is not an array, resetting to empty array');
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCartItems([]);
      }
    }
    
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        // Ensure it's an array
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
        } else {
          console.warn('Favorites data is not an array, resetting to empty array');
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
        setFavorites([]);
      }
    }
  }, []);

  // Save to localStorage whenever cart or favorites change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('celenk-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('celenk-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    // Normalize/guard product fields to prevent broken cart entries
    if (!product?.id || !product?.name) {
      console.warn('addToCart skipped: missing id or name', product);
      return;
    }

    const normalizedPrice =
      typeof product.price === 'number'
        ? product.price
        : parseFloat(product.price as unknown as string) || 0;

    const images = Array.isArray(product.images) ? product.images : [];

    setCartItems(prev => {
      // Ensure prev is an array
      const currentItems = Array.isArray(prev) ? prev : [];
      
      const cartKey = `${product.id}-${variant?.id || 'default'}`;
      const existingItem = currentItems.find(item => 
        `${item.id}-${item.variantId || 'default'}` === cartKey
      );
      
      if (existingItem) {
        return currentItems.map(item =>
          `${item.id}-${item.variantId || 'default'}` === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const cartItem: CartItem = {
          ...product,
          quantity: 1,
          variantId: variant?.id,
          variantName: variant?.name,
          image: images?.[0],
          price: variant ? variant.price : normalizedPrice,
          images,
        };
        return [...currentItems, cartItem];
      }
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.filter(item => 
        !(item.id === productId && (item.variantId || 'default') === (variantId || 'default'))
      );
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    
    setCartItems(prev => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.map(item =>
        item.id === productId && (item.variantId || 'default') === (variantId || 'default')
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const currentFavorites = Array.isArray(prev) ? prev : [];
      return currentFavorites.includes(productId)
        ? currentFavorites.filter(id => id !== productId)
        : [...currentFavorites, productId];
    });
  };

  const isInCart = (productId: string, variantId?: string) => {
    if (!Array.isArray(cartItems)) return false;
    return cartItems.some(item => 
      item.id === productId && (item.variantId || 'default') === (variantId || 'default')
    );
  };

  const isFavorite = (productId: string) => {
    if (!Array.isArray(favorites)) return false;
    return favorites.includes(productId);
  };

  const getTotalPrice = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        favorites,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleFavorite,
        isInCart,
        isFavorite,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
