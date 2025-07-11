import React from 'react';
import PropTypes from 'prop-types';
import '../styles/Chatbot.css';

const ChatMessage = ({ message }) => {
  const { sender, text, timestamp, product } = message;

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${sender}`}>
      {text && <span className="chat-text">{text}</span>}

      {product && (
        <div className="product-card">
          <h4 className="product-title">{product.name}</h4>
          <div className="product-details">
            <span className="product-detail">₹{product.price}</span>
            <span className="product-detail">{product.category}</span>
          </div>
          <ul className="product-features">
            {product.features?.map((feat, idx) => (
              <li key={idx}>• {feat}</li>
            ))}
          </ul>
        </div>
      )}

      {timestamp && <div className="timestamp">{formatTime(timestamp)}</div>}
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    sender: PropTypes.string.isRequired,
    text: PropTypes.string,
    product: PropTypes.object,
    timestamp: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatMessage;
