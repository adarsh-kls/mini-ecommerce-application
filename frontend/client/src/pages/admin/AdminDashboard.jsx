import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../../styles/adminDashboard.css";

const API_URL = "http://localhost:5000/api";

const PIE_COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Analytics Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Store Overview & Analytics</h1>
          <p>Real-time performance metrics and operational statistics</p>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">👥</div>
          <div className="stat-details">
            <span className="stat-title">Total Users</span>
            <span className="stat-value">{stats?.totalUsers || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">📦</div>
          <div className="stat-details">
            <span className="stat-title">Total Products</span>
            <span className="stat-value">{stats?.totalProducts || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">🛒</div>
          <div className="stat-details">
            <span className="stat-title">Total Orders</span>
            <span className="stat-value">{stats?.totalOrders || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">💰</div>
          <div className="stat-details">
            <span className="stat-title">Total Revenue</span>
            <span className="stat-value">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Secondary Status Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">⏳</div>
          <div className="stat-details">
            <span className="stat-title">Pending Orders</span>
            <span className="stat-value">{stats?.pendingOrders || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">⚙️</div>
          <div className="stat-details">
            <span className="stat-title">Processing</span>
            <span className="stat-value">{stats?.processingOrders || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">🚚</div>
          <div className="stat-details">
            <span className="stat-title">Shipped</span>
            <span className="stat-value">{stats?.shippedOrders || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">✅</div>
          <div className="stat-details">
            <span className="stat-title">Delivered</span>
            <span className="stat-value">{stats?.deliveredOrders || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-rose">❌</div>
          <div className="stat-details">
            <span className="stat-title">Cancelled</span>
            <span className="stat-value">{stats?.cancelledOrders || 0}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts with Recharts */}
      <div className="charts-grid">
        {/* Revenue Over Time Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Over Time (Paid)</h3>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            {stats?.salesOverTime?.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={stats.salesOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#111827", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-loading">No sales timeline data</div>
            )}
          </div>
        </div>

        {/* Orders Over Time Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Orders Placed Over Time</h3>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            {stats?.salesOverTime?.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={stats.salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#111827", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-loading">No order timeline data</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution Donut Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Order Status Breakdown</h3>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            {stats?.orderStatusDistribution?.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.orderStatusDistribution}
                    cx="35%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#111827", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: "#6b7280" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-loading">No order status data</div>
            )}
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="widgets-grid">
        {/* Top Selling Products */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">🔥 Top-Selling Products</h3>
          </div>
          <table className="widget-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topSellingProducts?.length > 0 ? (
                stats.topSellingProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p._id}</td>
                    <td><strong>{p.totalSold}</strong></td>
                    <td>₹{p.totalRevenue?.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: "center" }}>No sales recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">⚠️ Low-Stock Products</h3>
            <Link to="/admin/products" style={{ fontSize: "0.85rem", color: "#6366f1" }}>Manage</Link>
          </div>
          <table className="widget-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.lowStockProducts?.length > 0 ? (
                stats.lowStockProducts.map((prod) => (
                  <tr key={prod._id}>
                    <td>{prod.name}</td>
                    <td><strong>{prod.stock}</strong></td>
                    <td>
                      {prod.stock === 0 ? (
                        <span className="badge-out-stock">Out of Stock</span>
                      ) : (
                        <span className="badge-low-stock">Low Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: "center" }}>All products well-stocked</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">🛒 Recent Customer Orders</h3>
            <Link to="/admin/orders" style={{ fontSize: "0.85rem", color: "#6366f1" }}>View All</Link>
          </div>
          <table className="widget-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((ord) => (
                  <tr key={ord._id}>
                    <td>{ord.user?.name || "Customer"}</td>
                    <td>₹{ord.totalAmount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge-status badge-${(ord.orderStatus || "pending").toLowerCase()}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: "center" }}>No recent orders</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Users */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">👥 Recently Registered Users</h3>
            <Link to="/admin/users" style={{ fontSize: "0.85rem", color: "#6366f1" }}>View All</Link>
          </div>
          <table className="widget-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentUsers?.length > 0 ? (
                stats.recentUsers.map((usr) => (
                  <tr key={usr._id}>
                    <td>{usr.name}</td>
                    <td>{usr.email}</td>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>{usr.role}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: "center" }}>No recent users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;