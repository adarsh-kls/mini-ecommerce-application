import { useEffect, useState } from "react";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import "../styles/cart.css";

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await getCart();
            setCart(data.cart);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const data = await updateCartItem(productId, newQuantity);
            setCart(data.cart);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const data = await removeFromCart(productId);
            setCart(data.cart);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleClearCart = async () => {
        try {
            const data = await clearCart();
            setCart(data.cart);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <p className="cart-msg">Loading cart...</p>;
    }

    if (error) {
        return <p className="cart-msg error">{error}</p>;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="cart-container empty">
                <h2>Your Cart is Empty</h2>
                <button className="btn-primary" onClick={() => navigate("/shop")}>Continue Shopping</button>
            </div>
        );
    }

    const cartTotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    return (
        <div className="cart-container">
            <h1>My Cart</h1>
            <div className="cart-content">
                <div className="cart-items">
                    {cart.items.map((item) => (
                        <div className="cart-item" key={item.product._id}>
                            <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3>{item.product.name}</h3>
                                <p className="cart-item-price">₹{item.product.price}</p>
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
                                    </div>
                                    <button className="btn-remove" onClick={() => handleRemoveItem(item.product._id)}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Items ({cart.items.length}):</span>
                        <span>₹{cartTotal}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total:</span>
                        <span>₹{cartTotal}</span>
                    </div>
                    <button className="btn-checkout" onClick={() => navigate("/Checkout")}>Proceed to Checkout</button>
                    <button className="btn-clear" onClick={handleClearCart}>Clear Cart</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
