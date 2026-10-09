import { useEffect, useState } from "react";
import "../../styles/adminProducts.css";

const API_URL = "http://localhost:5000/api";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState({ lowStockProducts: [], pendingOrdersCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
        setAlerts(data.alerts || { lowStockProducts: [], pendingOrdersCount: 0 });
      }
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <div>
          <h1>System Alerts & Notifications</h1>
          <p>Real-time operational alerts for warehouse stock, customer orders, and store events</p>
        </div>
      </div>

      {/* Alert Highlights Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "1.5rem" }}>
        <div className="stat-card" style={{ borderColor: "rgba(245, 158, 11, 0.4)" }}>
          <div className="stat-header">
            <span className="stat-title">⚠️ Low Stock Products</span>
            <span style={{ fontSize: "1.5rem" }}>📦</span>
          </div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>
            {alerts.lowStockProducts?.length || 0} Items
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>
            Need immediate warehouse restocking
          </p>
        </div>

        <div className="stat-card" style={{ borderColor: "rgba(59, 130, 246, 0.4)" }}>
          <div className="stat-header">
            <span className="stat-title">⏳ Pending Orders</span>
            <span style={{ fontSize: "1.5rem" }}>🛍️</span>
          </div>
          <div className="stat-value" style={{ color: "#3b82f6" }}>
            {alerts.pendingOrdersCount || 0} Orders
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>
            Awaiting admin status confirmation
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="table-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "var(--admin-primary)" }}>
          🔔 Recent System Activity Logs
        </h3>

        {loading ? (
          <p>Loading activity logs...</p>
        ) : notifications.length === 0 && alerts.lowStockProducts.length === 0 ? (
          <p style={{ color: "var(--admin-text-muted)" }}>No active alerts or system notifications.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {alerts.lowStockProducts?.map((prod) => (
              <div
                key={prod._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
                  />
                  <div>
                    <strong style={{ color: "#f59e0b" }}>Low Stock Alert: {prod.name}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                      Only {prod.stock} units remaining in inventory
                    </div>
                  </div>
                </div>
                <span className="badge-low-stock">Stock &le; 10</span>
              </div>
            ))}

            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--admin-border)",
                  borderRadius: 8,
                }}
              >
                <div>
                  <strong>{notif.title}</strong>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                    {notif.message}
                  </p>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                  {new Date(notif.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNotifications;
