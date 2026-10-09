import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/auth";
import API from "../api/authApi";
import { getWishlist } from "../services/wishlistService";
import "../styles/navbar.css";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationServices";

const Navbar = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
    
    const fetchWislistCount = async () => {
      try {
        const data = await getWishlist();
        setWishlistCount(data.wishlist?.length || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWislistCount();

    const handleUpdate = () => fetchWislistCount();
    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, [token]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) return;
      try {
        const data = await getNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("error:", error);
      }
    };
    if (token) loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener("notificationUpdated", handleUpdate);
    return () => window.removeEventListener("notificationUpdated", handleUpdate);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!token || location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home">ShopIt</Link>
      </div>
      <div className="navbar-search" style={{ flex: "0 1 400px", margin: "0 2rem", position: "relative" }}>
         <input type="text" placeholder="Search for Products, Brands and More" style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #ccc", outline: "none", fontSize: "0.9rem" }} />
      </div>
      <ul className="navbar-links" style={{ gap: "2rem", marginRight: "3rem" }}>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/shop">Shop</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/wishlist">Wishlist ❤️ {wishlistCount > 0 && `(${wishlistCount})`}</Link></li>
      </ul>
      <div className="navbar-actions" style={{ gap: "1rem" }}>
        <div className="notification-container" ref={dropdownRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="btn-notification">
            🔔 {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await markAllNotificationsAsRead();
                        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                        setUnreadCount(0);
                      } catch (error) { console.error(error); }
                    }}
                    className="btn-mark-read"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="notification-empty">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification._id} onClick={async () => {
                        try {
                          if (!notification.isRead) {
                            await markNotificationAsRead(notification._id);
                            setNotifications((prev) => prev.map((item) => item._id === notification._id ? { ...item, isRead: true } : item));
                            setUnreadCount((count) => Math.max(0, count - 1));
                          }
                          if (notification.relatedOrder?._id) {
                            navigate(`/orders/${notification.relatedOrder._id}`);
                            setShowNotifications(false);
                          }
                        } catch (error) {}
                      }}
                      className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                    >
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-container" ref={profileDropdownRef} style={{ position: "relative", cursor: "pointer", marginLeft: "1rem" }}>
           <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f39b5d", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
                 {user ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
           </div>
           
           {showProfileMenu && (
             <div className="profile-dropdown" style={{ position: "absolute", top: "110%", right: "0", background: "white", border: "1px solid #ddd", borderRadius: "8px", width: "200px", zIndex: "1100", overflow: "hidden",boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)" }}>
               <div style={{ padding: "15px", borderBottom: "1px solid #eee", background: "#f8fafc" }}>
                  <p style={{ margin: 0, fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{user?.name || "Profile"}</p>
                  <p style={{ margin: 0, fontSize: "0.80rem", color: "#777" }}>{user?.email || ""}</p>
               </div>
               <Link to="/orders" onClick={() => setShowProfileMenu(false)} style={{ display: "block", padding: "10px 15px", textDecoration: "none", color: "#333", fontWeight: "500", borderBottom: "1px solid #eee" }}>My Orders</Link>
               <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 15px", border: "none", background: "white", cursor: "pointer", color: "#e74c3c", fontWeight: "600", borderTop: "1px solid #eee", borderRadius: "0", boxShadow: "none" }}>Logout</button>
             </div>
           )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
