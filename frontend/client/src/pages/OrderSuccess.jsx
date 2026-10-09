import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/checkout.css";

function OrderSuccess() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("lastOrder");
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
        localStorage.removeItem("lastOrder");
      } catch (err) {
        console.error("Error parsing saved order:", err);
      }
    }
  }, []);

  if (!order) {
    return (
      <div className="order-success-wrapper">
        <h2>Order Information Not Found</h2>
        <p className="subtitle">
          We couldn't find details of your recent order.
        </p>
        <div className="success-actions">
          <Link to="/shop" className="btn-primary-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-wrapper">
      <div className="success-badge-icon">✓</div>
      <h1>Order Placed Successfully!</h1>
      <p className="subtitle">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>

      <div className="order-details-card">
        <div className="order-details-header">
          <span className="order-id-label">Order #{order._id}</span>
          <span className="order-status-pill">{order.orderStatus || "Processing"}</span>
        </div>

        <div className="order-info-grid">
          {order.shippingAddress && (
            <div className="info-block">
              <h4>Shipping Details</h4>
              <p>{order.shippingAddress.fullName}</p>
              <p>📞 {order.shippingAddress.phone}</p>
              <p>
                {order.shippingAddress.addressLine},{" "}
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          )}

          <div className="info-block">
            <h4>Payment & Method</h4>
            <p>Method: {order.paymentMethod || "Cash on Delivery"}</p>
            <p>Payment Status: {order.paymentStatus || "Pending"}</p>
            {order.createdAt && (
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="order-items-summary">
            <h3>Items Ordered</h3>
            <div className="success-items-list">
              {order.items.map((item, idx) => (
                <div key={item._id || idx} className="success-item-row">
                  {item.image && (
                    <img src={item.image} alt={item.name} />
                  )}
                  <span className="success-item-name">{item.name}</span>
                  <span className="success-item-qty">Qty: {item.quantity}</span>
                  <span className="success-item-price">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="summary-breakdown">
          {order.subtotal !== undefined && (
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
          )}
          {order.shippingFee !== undefined && (
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}
              </span>
            </div>
          )}
          <div className="summary-total">
            <span>Total Paid / Due</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <Link to="/shop" className="btn-primary-link">
          Continue Shopping
        </Link>
        <Link to="/orders" className="btn-secondary-link">
          View My Orders
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;