import { Link } from "react-router-dom";
import { addToWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";

const ProductCard = ({ product }) => {
  const handleWishlist = async () => {
    try {
      await addToWishlist(product._id);
      window.dispatchEvent(new Event("wishlistUpdated"));
      alert("Product added to wishlist!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, 1);
      alert("Added to cart!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="product-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "15px", backgroundColor: "white", borderRadius: "10px", border: "1px solid #ebebeb", transition: "box-shadow 0.2s" }}>

      <div style={{ width: "100%", height: "180px", display: "flex", justifyContent: "center", alignItems: "center", paddingBottom: "10px" }}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </div>

      <div className="product-info" style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>

        <p className="product-brand" style={{ fontSize: "0.85rem", color: "#777", marginBottom: "5px" }}>
          {product.brand}
        </p>

        <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 10px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", minHeight: "2.4em" }}>{product.name}</h3>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <p className="product-price" style={{ fontWeight: "bold", fontSize: "1.1rem", margin: 0, color: "#222" }}>
            ₹{product.price}
            </p>
            <p style={{ margin: 0, fontSize: "0.85rem", background: "#388e3c", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
             {product.rating} ⭐
            </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
          <button 
            onClick={handleAddToCart} 
            style={{ width: "100%", padding: "10px", backgroundColor: "#ff9f00", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            Add to Cart
          </button>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to={`/products/${product._id}`} style={{ flex: 1, padding: "8px", backgroundColor: "#fff", color: "#333", textDecoration: "none", borderRadius: "5px", border: "1px solid #d7d7d7", textAlign: "center", fontWeight: "600" }}>
              Details
            </Link>
            
            <button onClick={handleWishlist} style={{ padding: "8px 12px", cursor: "pointer", background: "white", border: "1px solid #d7d7d7", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ❤️
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;