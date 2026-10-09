import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import API from "../api/authApi";
import { getProducts } from "../services/productServices";
import ProductCard from "../components/ProductCard";
import "../styles/home.css";

const sliderImages = [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
    "https://images.unsplash.com/photo-1607083206325-caf1edba7f0f?w=1200&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80"
];

const categories = [
   { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80" },
   { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80" },
   { name: "Home", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80" },
   { name: "Sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80" },
   { name: "Beauty", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80" },
   { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80" },
   { name: "Toys", image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80" }
];

function Home() {
    const navigate = useNavigate();
    const [newArrivals, setNewArrivals] = useState([]);
    const [trending, setTrending] = useState([]);
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSlideIndex((prev) => (prev + 1) % sliderImages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
             try {
                  const arrivalData = await getProducts({ limit: 4, sort: "newest" });
                  setNewArrivals(arrivalData.products || []);
                  
                  const trendingData = await getProducts({ limit: 4, sort: "price_desc" });
                  setTrending(trendingData.products || []);
             } catch(err) {
                  console.error(err);
             }
        };
        fetchProducts();
    }, []);

    return (
        <div className="home-wrapper">
             {/* Flipkart Style Categories Navbar */}
             <div className="sub-navbar-categories" style={{ display: "flex", justifyContent: "space-around", padding: "1rem", backgroundColor: "white", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                 {categories.map((cat, idx) => (
                     <div key={idx} onClick={() => navigate(`/shop?category=${cat.name}`)} style={{ cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                         <img src={cat.image} alt={cat.name} style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "50%" }} />
                         <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{cat.name}</span>
                     </div>
                 ))}
             </div>

             {/* Slider Section */}
             <div className="home-slider" style={{ width: "100%", height: "450px", overflow: "hidden", position: "relative", marginBottom: "0" }}>
                 {sliderImages.map((img, idx) => (
                     <div key={idx} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: idx === slideIndex ? 1 : 0, transition: "opacity 0.6s ease-in-out", backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                 ))}
             </div>

             {/* Special Offers block (Flipkart purple card style) */}
             <div className="special-offers-container" style={{ backgroundColor: "#6400c8", padding: "20px", borderRadius: "0", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "20px" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <h2 style={{ color: "white", margin: 0 }}>Special Offers</h2>
                     <button onClick={() => navigate("/shop")} style={{ borderRadius:"50%", padding: "10px", width:"40px", height:"40px" }}>→</button>
                 </div>
                 <div className="special-offers-scroll" style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "10px" }}>
                     {trending.slice(0, 4).map(prod => (
                         <div key={prod._id} className="flipkart-offer-card" style={{ flex: "0 0 auto", width: "220px", backgroundColor: "white", borderRadius: "8px", padding: "15px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => navigate(`/products/${prod._id}`)}>
                             <div style={{ width: "100px", height: "100px", display:"flex", justifyContent:"center", alignItems:"center"}}>
                                <img src={prod.image} style={{ maxHeight: "100px", maxWidth: "100px", objectFit: "contain" }} alt={prod.name} />
                             </div>
                             <p style={{ margin: "10px 0 5px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", textAlign: "center", fontWeight: "bold" }}>{prod.name}</p>
                             <p style={{ margin: 0, color: "#388e3c", fontWeight: "bold" }}>Min. 50% Off</p>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Dynamic Layout for Categories (AD style banners) */}
             <div className="dynamic-categories-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "3rem" }}>
                 {categories.slice(0, 3).map((cat, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", backgroundColor: "white" }}>
                         <div style={{ width: "100%", height: "200px" }}>
                             <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                         </div>
                         <div style={{ padding: "15px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                             <h3 style={{ margin: 0, color: "#333" }}>{cat.name}</h3>
                             <button onClick={() => navigate(`/shop?category=${cat.name}`)} style={{ padding: "8px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Explore Now</button>
                         </div>
                    </div>
                 ))}
             </div>

             {/* New Arrivals Section */}
             <section className="home-section" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                 <div className="section-title" style={{ borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "20px" }}>
                     <h2>New Arrivals</h2>
                     <Link to="/shop?sort=newest" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "white", backgroundColor: "#3498db", padding: "5px 15px", borderRadius: "5px" }}>See More</Link>
                 </div>
                 <div className="products-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                     {newArrivals.map(prod => (
                         <ProductCard key={prod._id} product={prod} />
                     ))}
                 </div>
             </section>
        </div>
    );
}

export default Home;
