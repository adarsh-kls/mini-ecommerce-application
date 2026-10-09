import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";
import "../../styles/adminUsers.css";

const API_URL = "http://localhost:5000/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Current logged in admin ID from auth storage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id || currentUser.id;

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modals
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      if (search) params.append("search", search);
      if (roleFilter && roleFilter !== "All") params.append("role", roleFilter);

      const response = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || (data.users ? data.users.length : 0));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUserId && newRole !== "admin") {
      alert("Self-Demotion Guard: You cannot demote your own admin account.");
      return;
    }

    try {
      setUpdatingId(userId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Role update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailsModal = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedUserDetails(data.user);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const openDeleteModal = (user) => {
    if (user._id === currentUserId) {
      alert("Self-Deletion Guard: You cannot delete your own admin account.");
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/users/${userToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  return (
    <div className="admin-users-container">
      {/* Header */}
      <div className="admin-users-header">
        <div>
          <h1>User & Role Management</h1>
          <p>Manage accounts, roles, permission levels, and view customer purchase history</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All User Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Role</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading registered accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No user accounts found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user._id === currentUserId;

                  return (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="user-avatar-circle">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <strong>
                              {user.name} {isSelf && <span style={{ color: "var(--admin-primary)", fontSize: "0.8rem" }}>(You)</span>}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`admin-select ${
                            user.role === "admin" ? "badge-role-admin" : "badge-role-customer"
                          }`}
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", fontWeight: 700 }}
                          value={user.role}
                          disabled={isSelf || updatingId === user._id}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <strong>{user.orderCount || 0}</strong> orders
                      </td>
                      <td>
                        <strong>₹{user.totalSpent?.toLocaleString() || 0}</strong>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => openDetailsModal(user._id)}
                          >
                            Activity History
                          </button>
                          <button
                            className="btn-action btn-delete"
                            disabled={isSelf}
                            onClick={() => openDeleteModal(user)}
                            style={{ opacity: isSelf ? 0.4 : 1, cursor: isSelf ? "not-allowed" : "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-container">
          <span className="pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalUsers} total accounts)
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

      {/* User Details & History Modal */}
      {showDetailsModal && selectedUserDetails && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2 className="modal-title">👤 Account Activity Overview</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Profile Card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  borderRadius: 12,
                  border: "1px solid var(--admin-border)",
                  marginBottom: "1.25rem",
                }}
              >
                <div className="user-avatar-circle" style={{ width: 52, height: 52, fontSize: "1.3rem" }}>
                  {selectedUserDetails.name ? selectedUserDetails.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{selectedUserDetails.name}</h3>
                  <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>
                    {selectedUserDetails.email}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>Total Paid Spend</div>
                  <h2 style={{ margin: 0, color: "var(--admin-emerald)" }}>
                    ₹{selectedUserDetails.totalSpent?.toLocaleString()}
                  </h2>
                </div>
              </div>

              {/* Order History */}
              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--admin-primary)" }}>
                🛒 Order History ({selectedUserDetails.totalOrdersCount || 0})
              </h4>
              <table className="widget-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserDetails.orders?.length > 0 ? (
                    selectedUserDetails.orders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <code>#{ord._id.slice(-6)}</code>
                        </td>
                        <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td>₹{ord.totalAmount?.toLocaleString()}</td>
                        <td>
                          <span className={`badge-status badge-${(ord.orderStatus || "pending").toLowerCase()}`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td>
                          <strong
                            style={{
                              color: ord.paymentStatus === "Paid" ? "var(--admin-emerald)" : "var(--admin-text-muted)",
                            }}
                          >
                            {ord.paymentStatus}
                          </strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "1.5rem" }}>
                        No orders placed by this user yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete User Account</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete user account{" "}
                <strong>"{userToDelete.name}"</strong> ({userToDelete.email})?
              </p>
              <p style={{ color: "var(--admin-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                This action is permanent and will remove the user's login access.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDeleteUser}>
                Confirm Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;