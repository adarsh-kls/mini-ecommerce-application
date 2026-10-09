import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/orderDetails.css";

const API_URL = "http://localhost:5000/api";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }

      setOrder(data.order);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container empty">
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container empty">
        <h2 className="cart-msg error">{error}</h2>
        <Link to="/orders" className="btn-checkout" style={{maxWidth: "250px", display: "inline-block"}}>Return to Orders</Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statuses = [
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];

  const currentStatus = order?.orderStatus?.toLowerCase();
  const currentIndex = statuses.indexOf(currentStatus);

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/orders/${order._id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully");

      setOrder(data.order);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const isCancellable = ["pending", "confirmed", "processing"].includes(order.orderStatus?.toLowerCase());

  return (
    <div className="order-details-container">
      
      <Link to="/orders" className="btn-back">← Back to my orders</Link>
      
      <div className="order-details-header">
        <div>
          <h1>Order #{order._id}</h1>
          <p>
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
        {isCancellable && (
          <button onClick={handleCancelOrder} className="btn-cancel">
            Cancel Order
          </button>
        )}
      </div>

      <div className="order-status-card">
        {order.orderStatus?.toLowerCase() === "cancelled" ? (
          <div style={{ textAlign: "center", color: "#ef4444", fontWeight: "600", fontSize: "1.2rem" }}>
            This order has been cancelled.
          </div>
        ) : (
          <div className="order-status-timeline">
            <div className="timeline-line"></div>
            <div 
              className="timeline-progress" 
              style={{ width: `${(Math.max(0, currentIndex) / (statuses.length - 1)) * 100}%` }}
            ></div>
            
            {statuses.map((status, index) => {
              const completed = index <= currentIndex;
              const current = index === currentIndex;

              return (
                <div key={status} className="timeline-step">
                  <div className={`timeline-circle ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}>
                    {completed && <span style={{fontSize: "1.2rem", fontWeight: "bold"}}>✓</span>}
                  </div>
                  <span className={`timeline-label ${completed ? 'completed' : ''}`}>
                    {status.replaceAll("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="order-content">
        <div className="order-items">
          {order.items.map((item, index) => (
            <div className="order-item" key={index}>
              <img 
                src={item.image || item.product?.image} 
                alt={item.name} 
                className="order-item-image" 
              />
              <div className="order-item-details">
                <h3>{item.name}</h3>
                <p className="order-item-qty">Qty: {item.quantity}</p>
                <div className="order-item-price-info">
                  <span className="order-item-price">₹{item.price} each</span>
                  <span className="order-item-subtotal">₹{item.subtotal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="order-sidebar">
          
          <div className="order-summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? "Free" : `₹${order.shippingFee}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="order-summary-card">
            <h2>Order Info</h2>
            
            <div className="info-block">
              <h3>Delivery Address</h3>
              <p style={{fontWeight: "600"}}>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>

            <div className="info-block" style={{marginTop: "1.5rem"}}>
              <h3>Payment</h3>
              <p>Method: {order.paymentMethod.toUpperCase()}</p>
              <p style={{marginTop: "0.5rem"}}>
                Status: <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OrderDetails;