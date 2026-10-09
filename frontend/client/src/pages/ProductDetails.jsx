import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";
import { addToCart } from "../services/cartService";
import "../styles/productDetails.css";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        },
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProductById(id);

                setProduct(data.product || data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = async () => {
        try {
            await addToCart(product._id, quantity);
            // alert("Added to cart successfully!");
            navigate("/cart");
        } catch (err) {
            alert(err.message);
        }
    };

    useEffect(() => {
        if (!product?._id) return;

        const fetchReviews = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/reviews/${product._id}`
                );

                const data = await response.json();

                if (data.success) {
                    setReviews(data.reviews);
                    setReviewSummary(data.summary);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };

        fetchReviews();
    }, [product?._id]);

    if (loading) {
        return <p className="product-loading">Loading product...</p>;
    }

    if (error) {
        return <p className="product-error">{error}</p>;
    }

    if (!product) {
        return <p className="product-error">Product not found.</p>;
    }

    return (
        <div className="product-details-page">

            <div className="product-details-container">

                {/* Product Image */}

                <div className="product-details-image-container">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-details-image"
                    />
                </div>


                {/* Product Information */}

                <div className="product-details-info">

                    <p className="product-details-brand">
                        {product.brand}
                    </p>

                    <h1>{product.name}</h1>

                    <p className="product-details-rating">
                        ⭐ {product.rating}
                    </p>

                    <h2 className="product-details-price">
                        ₹{product.price}
                    </h2>

                    <p className="product-details-description">
                        {product.description}
                    </p>


                    {/* Stock */}

                    <p className="product-stock" style={{ color: "#27ae60", fontWeight: "600", padding: "5px 0", fontSize: "0.95rem" }}>
                        {product.stock > 0
                            ? `${product.stock} items available`
                            : <span style={{ color: "#e74c3c" }}>Out of stock</span>
                        }
                    </p>


                    {/* Quantity */}

                    {product.stock > 0 && (
                        <div className="quantity-section">

                            <p>Quantity:</p>

                            <div className="quantity-controls">

                                <button
                                    onClick={decreaseQuantity}
                                    disabled={quantity === 1}
                                >
                                    −
                                </button>

                                <span>{quantity}</span>

                                <button
                                    onClick={increaseQuantity}
                                    disabled={quantity === product.stock}
                                >
                                    +
                                </button>

                            </div>

                        </div>
                    )}

                    {/* Buttons */}
                    <div className="product-actions mt-6">
                        <button
                            className="add-cart-button"
                            disabled={product.stock === 0}
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="buy-now-button"
                            disabled={product.stock === 0}
                            onClick={async () => {
                                await handleAddToCart();
                                navigate("/checkout");
                            }}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="max-w-[1000px] mx-auto mt-20 mb-10 bg-[var(--bg-surface)] p-8 md:p-10 rounded-2xl shadow-sm border border-[var(--border-light)]">
                <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">
                    Customer Reviews
                </h2>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 pb-8 border-b border-[var(--border-default)]">
                    <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-page)] rounded-xl min-w-[160px] border border-[var(--border-light)]">
                        <span className="text-5xl font-extrabold text-[var(--text-primary)]">
                            {reviewSummary.averageRating}
                        </span>
                        <div className="text-yellow-400 text-2xl mt-2 tracking-widest flex items-center">
                            {"★".repeat(Math.max(0, Math.min(5, Math.round(Number(reviewSummary.averageRating) || 0))))}
                            <span className="text-[var(--border-default)] flex items-center">
                                {"★".repeat(Math.max(0, 5 - Math.min(5, Math.round(Number(reviewSummary.averageRating) || 0))))}
                            </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-2 font-medium">
                            Based on {reviewSummary.totalReviews} reviews
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {reviews.map((review) => (
                        <div key={review._id} className="pb-8 border-b border-[var(--border-default)] last:border-0 last:pb-0">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] rounded-full flex items-center justify-center text-[var(--bg-page)] font-bold text-lg shadow-sm">
                                        {(review.user?.name || "A").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                                            {review.user?.name || "Anonymous"}
                                        </h3>
                                        <p className="text-sm text-[var(--text-muted)] font-medium">
                                            {new Date(review.createdAt || Date.now()).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400 text-lg">
                                    {"★".repeat(Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0))))}
                                    <span className="text-[var(--border-default)]">
                                        {"★".repeat(Math.max(0, 5 - Math.min(5, Math.round(Number(review.rating) || 0))))}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[var(--text-secondary)] leading-relaxed pl-16">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>

                {reviews.length === 0 && (
                    <div className="text-center py-12 bg-[var(--bg-page)] rounded-xl mt-6 border border-dashed border-[var(--border-default)]">
                        <p className="text-xl text-[var(--text-secondary)] mb-2">No reviews yet</p>
                        <p className="text-[var(--text-muted)]">Be the first to share your thoughts about this product.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ProductDetails;