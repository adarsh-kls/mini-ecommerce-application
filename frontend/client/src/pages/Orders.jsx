import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/checkout.css";

const API_URL = "http://localhost:5000/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch orders");
                }

                setOrders(data.orders || []);
            } catch (err) {
                console.error("Fetch orders error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (loading) {
        return (
            <div className="checkout-container">
                <div className="checkout-header">
                    <h1>My Orders</h1>
                    <p>Loading your order history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="checkout-container">
                <div className="checkout-header">
                    <h1>My Orders</h1>
                    <p style={{ color: "#ef4444" }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-700";

            case "shipped":
                return "bg-blue-100 text-blue-700";

            case "processing":
                return "bg-yellow-100 text-yellow-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h1>My Orders</h1>
                <p>View all your past and active orders.</p>
            </div>

            {orders.length === 0 ? (
                <div className="empty-address-box">
                    <p>You haven't placed any orders yet.</p>
                    <Link
                        to="/shop"
                        className="btn-submit-address"
                        style={{ textDecoration: "none", display: "inline-block" }}
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {orders.map((order) => (
                        <div key={order._id} className="order-details-card" style={{ margin: 0 }}>
                            <div className="order-details-header">
                                <div>
                                    <span className="order-id-label">Order #{order._id}</span>
                                    <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>
                                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <span className="order-status-pill">{order.orderStatus || "Pending"}</span>
                                    <Link
                                        to={`/orders/${order._id}`}
                                        style={{
                                            padding: "6px 15px",
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            textDecoration: "none",
                                            borderRadius: "6px",
                                            fontSize: "0.85rem",
                                            fontWeight: "500"
                                        }}
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>

                            {order.shippingAddress && (
                                <div className="address-text" style={{ marginBottom: "16px" }}>
                                    <strong>Deliver to:</strong> {order.shippingAddress.fullName} (📞 {order.shippingAddress.phone}) <br />
                                    {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                </div>
                            )}

                            {order.items && order.items.length > 0 && (
                                <div className="order-items-summary">
                                    <h3>Items Purchased</h3>
                                    <div className="success-items-list">
                                        {order.items.map((item, idx) => (
                                            <div key={item._id || idx} className="success-item-row">
                                                {(item.image || item.product?.image) && (
                                                    <img
                                                        src={item.image || item.product?.image}
                                                        alt={item.name || item.product?.name}
                                                    />
                                                )}
                                                <span className="success-item-name">
                                                    {item.name || item.product?.name || "Product"}
                                                </span>
                                                <span className="success-item-qty">Qty: {item.quantity}</span>
                                                <span className="success-item-price">
                                                    ₹{item.price * item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                                            order.orderStatus
                                        )}`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>
                            )}

                            <div className="summary-breakdown" style={{ marginTop: "12px", borderTop: "1px dashed var(--border)" }}>
                                <div className="summary-total">
                                    <span>Total Amount</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;
