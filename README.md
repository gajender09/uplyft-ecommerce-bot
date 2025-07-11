# 🛒 Uplyft E-commerce Sales Chatbot

A full-stack AI-powered chatbot built using React and Flask for the Uplyft Full Stack Internship. It simulates a modern e-commerce shopping assistant with product search, user login, chat history, export, and an elegant dark UI.

---

## Project Report & Presentation

### Project Report
A detailed report outlining the project’s objectives, architecture, features, challenges, and learnings is available in the repository.  
🔗 [View Project Report (PDF)](https://drive.google.com/file/d/1UythfdJz0b0TJ6TqL_sUdy6xb44iqoVP/view?usp=sharing)

### YouTube Presentation
🔗 [Watch Presentation](https://youtu.be/ed_i5urW9bs)

[![Watch the video](https://img.youtube.com/vi/ed_i5urW9bs/mqdefault.jpg)](https://youtu.be/ed_i5urW9bs)

A video walkthrough of the project, showcasing the chatbot’s functionality and UI.

## 🚀 Project Overview

This project simulates an e-commerce chatbot interface with smart product responses and history retention using a Flask + React stack. Users can log in, ask product-related queries in natural language, view suggestions, and download past conversations.

---

## 🔧 Tech Stack

* **Frontend**: React, CSS (glassmorphism UI), React Router, Axios
* **Backend**: Flask, Flask-CORS, SQLAlchemy, JWT Auth
* **Database**: SQLite
* **Other**: jsPDF (PDF/CSV export), jwt-decode, dotenv

---

## ✅ Features

* 🔐 User login/signup with JWT auth
* 💬 AI-style chat interface with timestamp
* 🍭 Product search from mock DB (100 entries)
* 🧠 Sample queries for phones, books, under ₹5000 etc
* 📁 Chat history per user
* 🖨 Export chat to PDF/CSV
* ♻ Reset chat session button
* 📱 Fully responsive, modern UI with dark glassmorphism theme

---

## 📁 Folder Structure

```
ecommerce-chatbot/
├── backend/
│   ├── app.py              # Flask server
│   ├── models.py           # SQLAlchemy models
│   ├── populate_db.py      # Adds 100 mock products
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Chatbot, Auth, History, etc.
│   │   ├── pages/          # Login, Signup pages
│   │   ├── styles/         # CSS files
│   │   └── App.js
│   └── package.json
└── README.md
```

---

## 🛠 Setup Instructions

### 1⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate     # (Windows)
pip install -r requirements.txt
python populate_db.py     # Seed 100 products
python app.py             # Run backend on http://localhost:5000
```

### 2⃣ Frontend Setup

```bash
cd frontend
npm install
npm start                # Runs at http://localhost:3000
```

---

## 🔐 Authentication

* Signup form collects: `name`, `email`, `username`, `password`
* Login issues a JWT token saved in `localStorage`
* Auth is required to access chatbot interface

---

## 💬 Sample Queries

You can ask:

* "Show me phones under 10000"
* "Suggest books for beginners"
* "T-shirts below 500"
* "Motivational books"
* "Eco-friendly textiles"

---

## 📜 Export Chat

Users can export their chat as:

* **PDF**: formatted and downloadable
* **CSV**: for spreadsheet or analysis

---

## 📷 UI Preview

| Interface      | Description       |
| -------------- | ----------------- |
| Login / Signup | Secure auth forms |
| Chatbot UI     | Conversational UI |
| Product Cards  | Search results    |
| Chat History   | Per-user view     |
| Export Tools   | PDF / CSV buttons |

> Add screenshots if required in a `screenshots/` folder.

---

## 📦 Backend Requirements

`backend/requirements.txt`:

```
Flask
Flask-CORS
Flask-SQLAlchemy
PyJWT
```

---

## 📦 Frontend Dependencies

`frontend/package.json`:

```json
"dependencies": {
  "axios": "^x.x.x",
  "jwt-decode": "^x.x.x",
  "jspdf": "^x.x.x",
  "jspdf-autotable": "^x.x.x",
  "react-router-dom": "^x.x.x"
}
```

---

## 💡 Tips for Use

* After login, chat history auto-loads.
* Use reset to start new session.
* All messages are timestamped.
* Export history anytime from History panel.

---

## 👨‍💼 Author

**Gajender Mandiwal**
📧 [mandiwalgajender0001@gmail.com](mailto:mandiwalgajender0001@gmail.com)
🔗 [GitHub Profile](https://github.com/gajender09)

---

## 📃 License

For educational and internship assessment use under the Uplyft Full Stack Internship Program.

---
