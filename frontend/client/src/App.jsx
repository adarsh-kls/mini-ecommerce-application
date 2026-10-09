import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import Wishlist from "./pages/Wishlist";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const location = useLocation();
  const hideNavbarPaths = ["/", "/register"];
  const isNavbarVisible = !hideNavbarPaths.includes(location.pathname) && !location.pathname.startsWith('/admin');

  return (
    <>
      {isNavbarVisible && <Navbar />}
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ADMIN NESTED LAYOUT */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="/cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/register" element={<Register />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        }
      />

      <Route path="/checkout" element={<ProtectedRoute> <Checkout /> </ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute> <OrderSuccess /> </ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute> <Orders /> </ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute> <Wishlist /> </ProtectedRoute>} />

      <Route
        path="/orders/:id"
        element={<OrderDetails />}
      />

      <Route path="/products/:id" element={<ProductDetails />} />
    </Routes>
    </>
  );
}

export default App;