// src/components/History.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Chatbot.css";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

const History = () => {
  const userId = localStorage.getItem("user_id");
  const userName = localStorage.getItem("user_name");
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/history/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Chat History for ${userName}`, 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [["Sender", "Message", "Time"]],
      body: messages.map((msg) => [
        msg.sender,
        msg.text,
        formatTime(msg.timestamp),
      ]),
    });
    doc.save("chat-history.pdf");
  };

  const exportToCSV = () => {
    const csv = Papa.unparse({
      fields: ["Sender", "Message", "Time"],
      data: messages.map((msg) => [
        msg.sender,
        msg.text,
        formatTime(msg.timestamp),
      ]),
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "chat-history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📜 My Chat History</h2>
        <div className="history-buttons">
          <button onClick={() => navigate("/chat")}>💬 Back to Chat</button>
          <button onClick={exportToPDF}>📄 Export PDF</button>
          <button onClick={exportToCSV}>📁 Export CSV</button>
        </div>
      </div>

      <div className="history-list">
        {messages.length === 0 ? (
          <p className="empty-msg">No chat history found.</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`history-msg ${msg.sender === "user" ? "user" : "bot"}`}
            >
              <span className="sender">
                {msg.sender === "user" ? "You" : "Bot"}:
              </span>
              <span className="text">{msg.text}</span>
              <span className="time">{formatTime(msg.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
