import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";
import "../styles/shop.css";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          search,
          category,
          sort,
          page,
          limit: 8,
        });

        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, sort, page]);

  const handleSearchChange = (event) => {
    const newParams = new URLSearchParams(searchParams);
    if (event.target.value) {
      newParams.set("search", event.target.value);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (event) => {
    const newParams = new URLSearchParams(searchParams);
    if (event.target.value !== "All") {
      newParams.set("category", event.target.value);
    } else {
      newParams.delete("category");
    }
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  const handleSortChange = (event) => {
    const newParams = new URLSearchParams(searchParams);
    if (event.target.value !== "newest") {
      newParams.set("sort", event.target.value);
    } else {
      newParams.delete("sort");
    }
    newParams.set("page", 1);
    setSearchParams(newParams);
  };

  return (
    <div className="shop-page">

      {/* PAGE TITLE */}

      <h1>Shop</h1>


      {/* SEARCH + FILTERS */}

      <div className="shop-controls" style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px", flexWrap: "nowrap" }}>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          style={{ padding: "8px", flex: 1, maxWidth: "250px", borderRadius: "5px", border: "1px solid #ccc" }}
        />

        <select
          value={category}
          onChange={handleCategoryChange}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          <option value="All">
            All Categories
          </option>

          <option value="Shoes">
            Shoes
          </option>

          <option value="Clothing">
            Clothing
          </option>

          <option value="Electronics">
            Electronics
          </option>

          <option value="Accessories">
            Accessories
          </option>
        </select>


        <select
          value={sort}
          onChange={handleSortChange}
          style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "150px" }}
        >
          <option value="newest">
            Newest
          </option>

          <option value="price_asc">
            Price: Low to High
          </option>

          <option value="price_desc">
            Price: High to Low
          </option>

          <option value="rating">
            Highest Rated
          </option>
        </select>

      </div>


      {/* LOADING */}

      {loading && (
        <p>Loading products...</p>
      )}


      {/* ERROR */}

      {error && (
        <p>{error}</p>
      )}


      {/* PRODUCTS */}

      {!loading && !error && products.length > 0 && (

        <div className="product-grid">

          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}

        </div>

      )}


      {/* NO PRODUCTS */}

      {!loading &&
        !error &&
        products.length === 0 && (
          <p>No products found.</p>
        )
      }


      {/* PAGINATION */}

      {!loading && totalPages > 1 && (

        <div className="pagination">

          <button
            disabled={page === 1}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("page", page - 1);
              setSearchParams(newParams);
            }}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("page", page + 1);
              setSearchParams(newParams);
            }}
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
};

export default Shop;