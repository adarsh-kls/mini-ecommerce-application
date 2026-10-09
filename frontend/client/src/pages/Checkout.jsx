import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/checkout.css";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const createPaymentOrder = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "http://localhost:5000/api/payment/create-order",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const verifyPayment = async (paymentData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "http://localhost:5000/api/payment/verify",
    paymentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

function Checkout() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Get token
  const token = localStorage.getItem("token");

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_URL}/address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch addresses");
      }

      setAddresses(data.addresses);

      // Automatically select first address
      if (data.addresses.length > 0) {
        setSelectedAddress(data.addresses[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      setCart(data.cart);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const subtotal =
    cart?.items?.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ) || 0;

  const shippingFee = subtotal >= 1000 ? 0 : 50;
  const totalAmount = subtotal + shippingFee;

  useEffect(() => {
    fetchAddresses();
    fetchCart();
  }, []);

  // Input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open add form
  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    });
    setShowForm(true);
  };

  // Open edit form
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setShowForm(true);
  };

  // Submit address
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingAddress
        ? `${API_URL}/address/${editingAddress._id}`
        : `${API_URL}/address`;

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setShowForm(false);
      setEditingAddress(null);

      await fetchAddresses();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      // 1. Create Razorpay order
      const data = await createPaymentOrder();

      if (!data.success) {
        alert("Unable to create payment");
        return;
      }

      const razorpayOrder = data.razorpayOrder;

      // 2. Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "Your E-Commerce Store",

        description: "Order Payment",

        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              alert("Payment successful!");

              // 4. Create Order in DB now that payment succeeds
              const responseOrder = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  addressId: selectedAddress,
                  paymentMethod: "ONLINE",
                  transactionId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                }),
              });

              const orderData = await responseOrder.json();

              if (orderData.success && orderData.order) {
                localStorage.setItem("lastOrder", JSON.stringify(orderData.order));
              }

              // Alert Navbar to fetch new notification
              window.dispatchEvent(new Event("notificationUpdated"));

              // Navigate to your existing success page
              navigate(`/order-success`);
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error(error);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: "",
          email: "",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to start payment"
      );
    }
  };

  // Delete address
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/address/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete address");
      }

      if (selectedAddress === id) {
        setSelectedAddress(null);
      }

      await fetchAddresses();
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (paymentMethod === "ONLINE") {
      await handleOnlinePayment();
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      console.log("Order created:", data.order);

      // Save order for confirmation page
      localStorage.setItem("lastOrder", JSON.stringify(data.order));

      // Alert Navbar to fetch new notification
      window.dispatchEvent(new Event("notificationUpdated"));
      alert("Order placed successfully!");

      // Route to confirmation page
      navigate("/order-success");
    } catch (error) {
      console.error("Place order error:", error);
      alert(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Loading your shipping addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Review your items, select a delivery address, and place your order.</p>
      </div>

      <div className="checkout-layout">
        {/* Main Left Content */}
        <div className="checkout-main">
          {/* Section 1: Delivery Address */}
          <section className="checkout-section">
            <div className="section-header">
              <h2>
                <span className="step-number">1</span>
                Delivery Address
              </h2>
              <button className="btn-add-address" onClick={handleAddAddress}>
                + Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="empty-address-box">
                <p>You don't have any saved delivery addresses.</p>
                <button className="btn-submit-address" onClick={handleAddAddress}>
                  Add Address Now
                </button>
              </div>
            ) : (
              <div className="address-grid">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`address-card ${selectedAddress === address._id ? "selected" : ""
                      }`}
                    onClick={() => setSelectedAddress(address._id)}
                  >
                    <div className="address-card-header">
                      <input
                        type="radio"
                        name="address"
                        className="address-radio"
                        checked={selectedAddress === address._id}
                        onChange={() => setSelectedAddress(address._id)}
                      />
                      <div className="address-info">
                        <h3>{address.fullName}</h3>
                        <div className="address-phone">📞 {address.phone}</div>
                      </div>
                    </div>

                    <div className="address-text">
                      {address.addressLine}
                      <br />
                      {address.city}, {address.state} - {address.postalCode}
                      <br />
                      {address.country}
                    </div>

                    <div className="address-actions">
                      <button
                        type="button"
                        className="btn-action-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="btn-action-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address._id);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Form Container */}
            {showForm && (
              <div className="address-form-box">
                <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-input-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-input-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-input-group form-group-full">
                      <label>Address Line</label>
                      <textarea
                        name="addressLine"
                        placeholder="House/Flat No., Street, Area"
                        rows={2}
                        value={formData.addressLine}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-input-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-input-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-input-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="6-digit PIN code"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-input-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-btn-group" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn-submit-address" style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "bold", backgroundColor: "transparent", border: "2px solid var(--accent-main)", color: "var(--accent-main)", cursor: "pointer" }}>
                      {editingAddress ? "Update Address" : "Save & Select"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-address"
                      onClick={() => setShowForm(false)}
                      style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: "bold", backgroundColor: "transparent", border: "2px solid #ccc", color: "#555", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Section 2: Payment Method */}
          <section className="checkout-section">
            <div className="section-header">
              <h2>
                <span className="step-number">2</span>
                Payment Method
              </h2>
            </div>

            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-details">
                  <h4>💵 Cash on Delivery (COD)</h4>
                  <p>Pay with cash or digital UPI upon receiving your delivery.</p>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'ONLINE' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-details">
                  <h4>💳 Online Payment (Razorpay)</h4>
                  <p>Pay securely via Credit/Debit Cards, UPI, or Net Banking.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Sidebar Order Summary */}
        <div className="checkout-sidebar">
          <div className="checkout-sidebar-card">
            <h2>Order Summary</h2>

            {cartLoading ? (
              <p>Loading cart items...</p>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <div className="checkout-items-list">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="checkout-item-mini">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                        />
                      )}
                      <div className="item-mini-info">
                        <h4>{item.product.name}</h4>
                        <p>
                          ₹{item.product.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="item-mini-price">
                        ₹{item.product.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping Fee</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="free-shipping-tag">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  className="btn-place-order"
                  onClick={handlePlaceOrder}
                  disabled={
                    placingOrder ||
                    !selectedAddress ||
                    !cart ||
                    !cart.items ||
                    cart.items.length === 0
                  }
                >
                  {placingOrder ? "Placing Order..." : "Place Order Now"}
                </button>

                
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;