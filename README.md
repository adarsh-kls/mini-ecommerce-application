# Shopit - Modern MERN Stack E-commerce Application

Shopit is a premium, full-featured e-commerce platform built on the MERN stack (MongoDB, Express, React, Node.js). It features a modern, clean, and interactive user interface along with a robust, secure backend and a comprehensive Admin Panel for store management.

## 🚀 Features

### Customer Experience
*   **Modern UI/UX**: Clean layout, responsive design, and smooth micro-animations. Active state scaling and gradient aesthetics.
*   **Authentication & Profiles**: Secure sign-up/login with JWT. User profile management.
*   **Product Discovery**: Seamless browsing with categories, special offers, and advanced search functionality.
*   **Shopping Cart & Wishlist**: Persistent cart and wishlist for easy shopping.
*   **Checkout & Payments**: Elegant address management, COD (Cash on Delivery), and secure online payments via Razorpay.
*   **Order Tracking**: Detailed order status and history timeline tracking.
*   **Reviews & Ratings**: Customers can leave product reviews and ratings.

### Admin Dashboard
*   **Role-Based Access Control (RBAC)**: Secure admin verification and creation.
*   **Analytics**: Visual data representation using Recharts for sales and inventory insights.
*   **Product & Category Management**: Full CRUD operations for products and product categories.
*   **Order Management**: Track orders, update status, and manage fulfillments.
*   **User Management**: Monitor user accounts and permissions.
*   **Review Moderation**: Admins can manage and moderate user reviews.

### Security & Performance
*   Data sanitization and protection against injection attacks (MongoDB Sanitization).
*   API Rate Limiting to prevent abuse.
*   Helmet for securing HTTP headers.
*   CORS configured for safe cross-origin requests.

---

## 🛠️ Tech Stack

**Frontend:**
*   React 19 (via Vite)
*   React Router DOM (for navigation)
*   Recharts (for Admin data visualization)
*   Axios (for API client)
*   Vanilla CSS (Custom variables for dynamic and premium themes)

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose
*   JSON Web Token (JWT)
*   Bcrypt (for password hashing)
*   Razorpay (payment gateway)
*   Helmet, express-rate-limit, express-mongo-sanitize (Security)

---

## 💻 Getting Started

### Prerequisites
*   Node.js
*   MongoDB Database (Local or MongoDB Atlas)
*   Razorpay API Keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd "Ecommerce app"
   ```

2. **Setup Server:**
   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend/client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

### Running the Application

1. **Start the Backend Server (from the `server` folder):**
   ```bash
   npm run dev
   ```

2. **Start the Frontend Client (from the `frontend/client` folder):**
   ```bash
   npm run dev
   ```

The application will now be running concurrently. Open `http://localhost:5173` (or your configured Vite port) in your browser.

---

## 🛡️ Security Measures
*   `express-mongo-sanitize` to defend against NoSQL injection.
*   `express-rate-limit` for DDoS mitigation.
*   `helmet` applies standard security headers.
*   Strong password encryption using `bcrypt`.
*   Token-based authentication with expiration limits.
