// src/components/Chatbot.jsx
import { FiLogOut, FiRotateCcw, FiBookOpen } from "react-icons/fi"; // Feather Icons

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Chatbot.css";

const Chatbot = () => {
  const userId = localStorage.getItem("user_id");
  const userName = localStorage.getItem("user_name");
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);

  const predefinedQueries = [
    "smartphones under ₹20000",
    "bluetooth headphones",
    "non-fiction books",
    "lightweight laptops",
    "casual jackets",
    "romantic fiction novels",
    "smartwatches under ₹10000",
    "self help books",
    "woolen sweaters",
    "graphic cotton t-shirts",
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/history/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSend = async (customMessage = null) => {
    const message = customMessage || input.trim();
    if (!message) return;

    const userMsg = {
      sender: "user",
      text: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        user_id: userId,
        message: message,
      });

      const botMsg = {
        sender: "bot",
        text: res.data.reply,
        timestamp: new Date().toISOString(),
        products: res.data.products || [],
        suggestions: res.data.suggestions || [],
      };

      setMessages((prev) => [...prev, botMsg]);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! Something went wrong. Please try again later.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleReset = () => {
    setMessages([]);
    localStorage.setItem("chatReset", Date.now());
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="chatbot-container">
      <header className="chatbot-header">
        <h2>🛒 Uplyft ShopBot</h2>
        <div className="chatbot-header-buttons">
          <button className="header-btn" onClick={() => navigate("/history")}>
            <FiBookOpen className="btn-icon" /> History
          </button>
          <button className="header-btn" onClick={handleReset}>
            <FiRotateCcw className="btn-icon" /> Reset Chat
          </button>
          <button className="header-btn" onClick={handleLogout}>
            <FiLogOut className="btn-icon" /> Logout
          </button>
        </div>
      </header>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${
              msg.sender === "user" ? "user-msg" : "bot-msg"
            }`}
          >
            <div className="chat-text">{msg.text}</div>

            {msg.products && msg.products.length > 0 && (
              <div className="product-carousel">
                {msg.products.map((p, i) => (
                  <div className="product-card" key={i}>
                    <h4>{p.name}</h4>
                    <span className={`tag tag-${p.category.toLowerCase()}`}>
                      {p.category}
                    </span>
                    <p>₹{p.price.toLocaleString()}</p>
                    <div className="features">
                      {p.features.map((f, j) => (
                        <span key={j} className="feature">
                          {f.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="timestamp">{formatTime(msg.timestamp)}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble bot-msg typing">
            <div className="dot-flashing"></div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestion-section">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-btn"
              onClick={() => handleSend(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="quick-queries">
        <h5>Try asking:</h5>
        {predefinedQueries.map((q, i) => (
          <button key={i} className="quick-btn" onClick={() => handleSend(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="chat-input-box">
        <input
          type="text"
          placeholder="Ask me something like ‘smartphones under ₹15000’"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={() => handleSend()}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
