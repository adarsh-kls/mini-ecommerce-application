import { useAuth } from "../../context/auth";

function AdminTopbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          ☰
        </button>
        <div className="topbar-title">
          <h2>Dashboard Management</h2>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-badge">
          <span className="badge-pulse"></span>
          <span className="badge-text">System Live</span>
        </div>

        <div className="topbar-profile">
          <span className="profile-role">Role: <strong>{user?.role || "admin"}</strong></span>
          <div className="profile-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
