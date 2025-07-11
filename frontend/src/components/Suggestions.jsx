import React from 'react';
import PropTypes from 'prop-types';

const Suggestions = ({ showSuggestions, setShowSuggestions, onSuggestionClick, messages, onFilter }) => {
  const suggestions = [
    'Smartphones under ₹20000',
    'Cotton shirts',
    'Fiction books',
    'Waterproof headphones',
  ];

  const filters = {
    category: ['Electronics', 'Clothing', 'Books'],
    price: ['10000', '20000', '50000'],
    feature: ['Waterproof', 'Wireless', 'Organic'],
  };

  return (
    <div className="suggestions-container">
      <button
        className="suggestion-toggle"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
      </button>
      {showSuggestions && (
        <>
          <div className="suggestions">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Categories:</span>
            {filters.category.map((category, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => onFilter('category', category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Price:</span>
            {filters.price.map((price, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => onFilter('price', price)}
              >
                Under ₹{price}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Features:</span>
            {filters.feature.map((feature, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                onClick={() => onFilter('feature', feature)}
              >
                {feature}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

Suggestions.propTypes = {
  showSuggestions: PropTypes.bool.isRequired,
  setShowSuggestions: PropTypes.func.isRequired,
  onSuggestionClick: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  onFilter: PropTypes.func.isRequired,
};

export default Suggestions;