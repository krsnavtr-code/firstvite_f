import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddToCartButton = ({ product, className = '' }) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      title: product.title || 'Untitled Product',
      price: product.price || 0,
      image: product.image || '',
    });

    toast.success(`${product.title} added to cart!`, {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className={className}>
      <button
        onClick={handleAddToCart}
        disabled={!product || isInCart(product.id)}
        className={`w-full px-6 py-3 rounded-md font-medium transition-colors ${
          isInCart(product?.id)
            ? 'bg-green-600 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isInCart(product?.id) ? '✓ Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default AddToCartButton;
