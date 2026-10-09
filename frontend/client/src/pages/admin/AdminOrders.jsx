import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";
import "../../styles/adminOrders.css";

const API_URL = "http://localhost:5000/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      if (search) params.append("search", search);
      if (statusFilter && statusFilter !== "All") params.append("status", statusFilter);

      const response = await fetch(`${API_URL}/orders/admin/all?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setTotalOrders(data.totalOrders || (data.orders ? data.orders.length : 0));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newOrderStatus, newPaymentStatus) => {
    try {
      setUpdatingId(orderId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/orders/admin/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...data.order } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...data.order });
        }
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const openInvoiceModal = (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const orderTimeline = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

  return (
    <div className="admin-orders-container">
      {/* Header */}
      <div className="admin-orders-header">
        <div>
          <h1>Order Management & Fulfillment</h1>
          <p>Track, process, update, and print invoices for customer orders</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search orders by ID, customer name, email..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading customer orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No orders found matching search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <code style={{ fontSize: "0.85rem", color: "var(--admin-primary)" }}>
                        #{order._id.slice(-8)}
                      </code>
                    </td>
                    <td>
                      <strong>{order.user?.name || "Customer"}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                        {order.user?.email || "No email"}
                      </div>
                    </td>
                    <td>
                      <strong>₹{order.totalAmount?.toLocaleString()}</strong>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                        value={order.orderStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value, order.paymentStatus)
                        }
                      >
                        {["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                          (status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        style={{ padding: "0.35rem 0.5rem", fontSize: "0.85rem" }}
                        value={order.paymentStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, order.orderStatus, e.target.value)
                        }
                      >
                        {["Pending", "Paid", "Failed", "Refunded"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => openDetailsModal(order)}
                        >
                          Details
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => openInvoiceModal(order)}
                        >
                          🖨️ Invoice
                        </button>
                      </div>
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
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalOrders} total orders)
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

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2 className="modal-title">📦 Order #{selectedOrder._id}</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Order Timeline Progress */}
              <div className="order-timeline-container">
                {orderTimeline.map((step, idx) => {
                  const currentIdx = orderTimeline.indexOf(selectedOrder.orderStatus);
                  const isCompleted = currentIdx >= idx;
                  const isCancelled = selectedOrder.orderStatus === "Cancelled";

                  return (
                    <div
                      key={step}
                      className={`timeline-step ${
                        isCancelled ? "cancelled" : isCompleted ? "completed" : ""
                      }`}
                    >
                      {isCancelled && idx === 0 ? "Cancelled" : step}
                    </div>
                  );
                })}
              </div>

              {/* Customer & Shipping Details Grid */}
              <div className="modal-grid-2" style={{ marginBottom: "1.25rem" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--admin-primary)" }}>
                    👤 Customer Information
                  </h4>
                  <p style={{ margin: 0 }}><strong>{selectedOrder.user?.name}</strong></p>
                  <p style={{ margin: 0, color: "var(--admin-text-muted)" }}>
                    {selectedOrder.user?.email}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--admin-primary)" }}>
                    📍 Shipping Address
                  </h4>
                  <p style={{ margin: 0 }}><strong>{selectedOrder.shippingAddress?.fullName}</strong></p>
                  <p style={{ margin: 0 }}>{selectedOrder.shippingAddress?.addressLine}</p>
                  <p style={{ margin: 0, color: "var(--admin-text-muted)" }}>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p style={{ margin: 0, color: "var(--admin-text-muted)" }}>
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <h4 style={{ margin: "1rem 0 0.5rem 0", color: "var(--admin-primary)" }}>
                🛍️ Ordered Items ({selectedOrder.items?.length || 0})
              </h4>
              <table className="widget-table" style={{ marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
                          />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>₹{item.price?.toLocaleString()}</td>
                      <td>x{item.quantity}</td>
                      <td><strong>₹{item.subtotal?.toLocaleString()}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Payment Summary */}
              <div
                style={{
                  display: "flex",
                  justify: "space-between",
                  padding: "1rem",
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  borderRadius: 8,
                  border: "1px solid var(--admin-border)",
                }}
              >
                <div>
                  <p style={{ margin: 0 }}>Method: <strong>{selectedOrder.paymentMethod}</strong></p>
                  <p style={{ margin: 0 }}>Payment Status: <strong>{selectedOrder.paymentStatus}</strong></p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0 }}>Subtotal: ₹{selectedOrder.subtotal?.toLocaleString()}</p>
                  <p style={{ margin: 0 }}>Shipping: ₹{selectedOrder.shippingFee?.toLocaleString()}</p>
                  <h3 style={{ margin: "0.25rem 0 0 0", color: "var(--admin-primary)" }}>
                    Total: ₹{selectedOrder.totalAmount?.toLocaleString()}
                  </h3>
                </div>
              </div>
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

      {/* Printable Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 800, background: "#fff", color: "#000" }}>
            <div className="modal-header no-print" style={{ borderBottom: "1px solid #e2e8f0" }}>
              <h2 className="modal-title" style={{ color: "#0f172a" }}>📄 Order Invoice</h2>
              <button
                className="btn-close-modal"
                style={{ color: "#64748b" }}
                onClick={() => setShowInvoiceModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body printable-invoice">
              <div className="invoice-box">
                <div className="invoice-header">
                  <div>
                    <div className="invoice-title">E-COMMERCE STORE</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Official Order Receipt</div>
                  </div>
                  <div className="invoice-meta">
                    <div><strong>INVOICE #:</strong> INV-{selectedOrder._id.slice(-8).toUpperCase()}</div>
                    <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> {selectedOrder.orderStatus}</div>
                  </div>
                </div>

                <div className="invoice-address-grid">
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", color: "#475569" }}>Billed To:</h4>
                    <div><strong>{selectedOrder.user?.name}</strong></div>
                    <div>{selectedOrder.user?.email}</div>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", color: "#475569" }}>Shipped To:</h4>
                    <div><strong>{selectedOrder.shippingAddress?.fullName}</strong></div>
                    <div>{selectedOrder.shippingAddress?.addressLine}</div>
                    <div>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                    </div>
                    <div>Phone: {selectedOrder.shippingAddress?.phone}</div>
                  </div>
                </div>

                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Product Description</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>₹{item.price?.toLocaleString()}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.subtotal?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="invoice-total-section">
                  <div className="invoice-total-box">
                    <div className="invoice-total-row">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="invoice-total-row">
                      <span>Shipping Fee:</span>
                      <span>₹{selectedOrder.shippingFee?.toLocaleString()}</span>
                    </div>
                    <div className="invoice-total-row grand">
                      <span>Total Amount:</span>
                      <span>₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer no-print" style={{ borderTop: "1px solid #e2e8f0" }}>
              <button
                className="btn-cancel"
                onClick={() => setShowInvoiceModal(false)}
              >
                Close
              </button>
              <button
                className="btn-save"
                onClick={() => window.print()}
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;