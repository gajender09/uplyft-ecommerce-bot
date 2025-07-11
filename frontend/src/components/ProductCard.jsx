import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Chatbot.css';

const ProductCard = ({ product, onViewProduct }) => (
  <div className="product-card" onClick={() => onViewProduct(product)}>
    <img
      src={`https://via.placeholder.com/100?text=${encodeURIComponent(product.name)}`}
      alt={product.name}
      className="product-image"
    />
    <h4 className="product-title">{product.name}</h4>
    <div className="product-details">
      <span className="product-detail">{product.category}</span>
      <span className="product-detail">₹{product.price.toLocaleString('en-IN')}</span>
    </div>
    <ul className="product-features">
      {product.features.map((f, idx) => (
        <li key={idx} className={f.toLowerCase().includes('waterproof') ? 'highlight' : ''}>{f}</li>
      ))}
    </ul>
    <div className="product-actions">
      <button className="product-button">Add to Cart</button>
      <button className="product-button secondary" onClick={(e) => { e.stopPropagation(); onViewProduct(product); }}>
        View Details
      </button>
    </div>
  </div>
);

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onViewProduct: PropTypes.func.isRequired,
};

export default ProductCard;