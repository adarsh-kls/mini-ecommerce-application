import { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../services/cartService";
import "../styles/wishlist.css";
const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await getWishlist();
            setWishlist(data.wishlist || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId) => {
        try {
            const data = await removeFromWishlist(productId);
            setWishlist(data.wishlist || []);
            window.dispatchEvent(new Event("wishlistUpdated"));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
            alert("Added to cart!");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <div className="wishlist-container">
                <h1>My Wishlist</h1>

                {loading && <p className="wishlist-msg">Loading wishlist...</p>}

                {error && <p className="wishlist-msg error">{error}</p>}

                {!loading && !error && wishlist.length === 0 && (
                    <div className="wishlist-empty">
                        <h2>Your wishlist is Empty</h2>
                        <button className="btn-primary" onClick={() => navigate("/shop")}>Explore Products</button>
                    </div>
                )}

                {!loading && !error && wishlist.length > 0 && (
                    <div className="wishlist-grid">
                        {wishlist.map((item) => (
                            <div className="wishlist-card" key={item._id}>
                                <div className="wishlist-img-wrapper" onClick={() => navigate(`/products/${item._id}`)} style={{ cursor: "pointer" }}>
                                    <img src={item.image} alt={item.name} className="wishlist-img" style={{ objectFit: "contain", width: "100%", height: "200px" }} />
                                </div>
                                <div className="wishlist-details">
                                    <h3 className="wishlist-title">{item.name}</h3>
                                    <p className="wishlist-price">₹{item.price}</p>
                                    <div className="wishlist-actions" style={{ flexDirection: "column", gap: "10px" }}>
                                        <button 
                                            className="btn-view" 
                                            onClick={() => handleAddToCart(item._id)} 
                                            style={{ backgroundColor: "#3498db" }}>
                                            Add to Cart
                                        </button>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button className="btn-view" onClick={() => navigate(`/products/${item._id}`)}>View Product</button>
                                            <button className="btn-remove-wishlist" onClick={() => handleRemove(item._id)} style={{ color: "black", backgroundColor: "#f8f9fa", border: "1px solid #ccc", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Remove Wishlist</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default Wishlist;
