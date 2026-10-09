import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

function AdminSidebar({ isOpen, toggleSidebar }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: "📊", exact: true },
    { label: "Products", path: "/admin/products", icon: "📦" },
    { label: "Categories", path: "/admin/categories", icon: "🏷️" },
    { label: "Inventory", path: "/admin/inventory", icon: "🏬" },
    { label: "Orders", path: "/admin/orders", icon: "🛒" },
    { label: "Users", path: "/admin/users", icon: "👥" },
    { label: "Reviews", path: "/admin/reviews", icon: "⭐" },
    { label: "Notifications", path: "/admin/notifications", icon: "🔔" },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: "📜" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <span className="admin-brand-icon">⚡</span>
            <span className="admin-brand-text">Admin Panel</span>
          </div>
          <button className="admin-sidebar-close" onClick={toggleSidebar}>
            ✕
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => {
                if (window.innerWidth <= 768) toggleSidebar();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.name || "Administrator"}</span>
              <span className="admin-user-email">{user?.email || "admin@store.com"}</span>
            </div>
          </div>
          <button className="btn-admin-logout" onClick={handleLogout}>
            <span></span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
