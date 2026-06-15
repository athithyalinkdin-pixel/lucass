# Lucas Agro & Naturals - Frontend Reconstructed Source

This directory contains the reconstructed source code of the **Lucas Agro & Naturals** React application, recovered and unminified from the production build ZIP.

---

## 1. Tech Stack Overview
*   **Framework**: React 18+
*   **Router**: React Router DOM v7
*   **Build Tool**: Vite 6+
*   **Styling**: Tailwind CSS v3 + custom CSS variables/animations
*   **Payment Integration**: Razorpay SDK
*   **State Management**: Native React Contexts (`AuthContext` & `CartContext`)

---

## 2. Getting Started

### Prerequisites
*   Node.js v18 or later
*   npm v9 or later

### Installation
1.  Navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration
1.  Copy the environment variables template:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and fill in the values:
    *   `VITE_API_URL`: The URL of your API backend (e.g. `http://localhost:5000/api` for local or `https://lucass-6.onrender.com/api` for production).
    *   `VITE_RAZORPAY_KEY_ID`: Your Razorpay client identifier (for test mode, use keys starting with `rzp_test_`).

### Running Locally
1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### Building for Production
1.  Compile the build bundle:
    ```bash
    npm run build
    ```
2.  The output will be saved inside the `dist/` directory, ready to be uploaded to hosting platforms (e.g. public_html directory for shared hosting).

---

## 3. Directory Layout Highlights
*   `src/components`: Reusable layouts including the sticky `Navbar`, `Footer`, `ProtectedRoute` check, and Framer Motion `FloatingLeaves`.
*   `src/context`: Provider contexts (`AuthContext` for login sessions, `CartContext` for cart calculations).
*   `src/pages`: Customer views (Shop, ProductDetail, Cart, Checkout, Blog) and admin dashboards (Products, Blog, and Testimonials CRUD).
*   `src/services/api.js`: Centralized Axios instance configuration.
*   `src/index.css`: Global base layers, custom inputs focus, and `.glass-card` styling.
