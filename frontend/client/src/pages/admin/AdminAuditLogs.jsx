import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";

const API_URL = "http://localhost:5000/api";

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [actionFilter, setActionFilter] = useState("All");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 12);
      if (actionFilter && actionFilter !== "All") params.append("action", actionFilter);

      const response = await fetch(`${API_URL}/admin/audit-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotalLogs(data.totalLogs || 0);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="admin-products-container">
      {/* Header */}
      <div className="admin-products-header">
        <div>
          <h1>Security & Operational Audit Logs</h1>
          <p>Track administrator actions, stock updates, role modifications, and system configuration changes</p>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="filter-group">
          <select
            className="admin-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Audit Action Types</option>
            <option value="SETTINGS_UPDATED">Settings Updates</option>
            <option value="STOCK_UPDATED">Stock Adjustments</option>
            <option value="ROLE_CHANGED">Role Modifications</option>
            <option value="PRODUCT_CREATED">Product Creations</option>
            <option value="REVIEW_DELETED">Review Moderations</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin User</th>
                <th>Action Type</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <strong>{log.admin?.name || "System Admin"}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                        {log.admin?.email}
                      </div>
                    </td>
                    <td>
                      <code style={{ padding: "0.2rem 0.5rem", borderRadius: 4, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                        {log.action}
                      </code>
                    </td>
                    <td style={{ maxWidth: 350 }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text-main)" }}>
                        {log.details}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                        {log.ipAddress}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-container">
          <span className="pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalLogs} total audit logs)
          </span>
          <div className="pagination-buttons">
            <button
              className="btn-page"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`btn-page ${pageNum === page ? "active" : ""}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="btn-page"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAuditLogs;
