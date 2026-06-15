# Lucas Agro & Naturals - Project Source Directory

This workspace contains the complete recovered source code for **Lucas Agro & Naturals**, including both the React frontend and the Express/MySQL backend.

---

## 1. Directory Structure

```
lucasagronaturals.com/
├── frontend/               # Reconstructed React + Vite + Tailwind frontend source
├── nodejs/                 # Express.js + MySQL backend source code
├── database-schema.md      # Detailed documentation of inferred database tables
├── reconstruction_report.md# Rebuilder tech analysis, confidence scores & logs
└── README.md               # This files layout guide
```

---

## 2. Setup Guide

### 1. Database Setup (MySQL)
1.  Initialize a new MySQL database (e.g. named `lucas_agro_db`).
2.  Create the tables according to the specifications in [database-schema.md](file:///d:/_lucasagronaturals.com/database-schema.md).
3.  Add at least one category to `categories` (e.g. `1 - Weight Management` and `2 - Sugar Balance`).
4.  Add an administrator account to `users` with `role = 'admin'` to access the administrative dashboards.

### 2. Backend Server Setup (`nodejs/`)
1.  Navigate to the backend folder:
    ```bash
    cd nodejs
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment by adding a `.env` file containing:
    ```env
    PORT=5000
    NODE_ENV=development
    DB_HOST=localhost
    DB_USER=your_db_username
    DB_PASSWORD=your_db_password
    DB_NAME=lucas_agro_db
    JWT_SECRET=your_jwt_secret_token
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```
4.  Start the backend service:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:5000`.

### 3. Frontend App Setup (`frontend/`)
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `.env` as defined in `frontend/.env.example`.
4.  Launch dev server:
    ```bash
    npm run dev
    ```
    The app runs locally on `http://localhost:5173`.
