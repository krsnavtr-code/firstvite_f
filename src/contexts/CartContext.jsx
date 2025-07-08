import { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create context
const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isCartOpen: false,
  recentlyAdded: null,
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Item already in cart, don't add again
        updatedItems = [...state.items];
      } else {
        // Add new item
        updatedItems = [...state.items, { ...action.payload }];
      }

      const totalItems = updatedItems.length;
      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      toast.success(`${action.payload.title} added to cart!`);

      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice,
        isCartOpen: true,
        recentlyAdded: action.payload.id,
      };
    }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter((item) => item.id !== action.payload);
      const newTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = filteredItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      toast.info('Item removed from cart');

      return {
        ...state,
        items: filteredItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };



    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
      };

    case 'CLEAR_CART':
      toast.success('Cart cleared successfully!');
      return {
        ...initialState,
      };

    case 'LOAD_CART':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const { items, totalItems, totalPrice } = state;
    localStorage.setItem(
      'cart',
      JSON.stringify({ items, totalItems, totalPrice })
    );
  }, [state.items]);

  // Cart actions
  const addToCart = (product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: product,
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId,
    });
  };



  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId) => {
    return state.items.some((item) => item.id === productId);
  };

  // Calculate cart summary
  const cartSummary = {
    subtotal: state.totalPrice,
    tax: Math.round(state.totalPrice * 0.1), // 10% tax
    get total() {
      return this.subtotal + this.tax;
    },
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        isCartOpen: state.isCartOpen,
        recentlyAdded: state.recentlyAdded,
        cartSummary,
        addToCart,
        removeFromCart,
        toggleCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
