import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";
import "../../styles/adminInventory.css";

const API_URL = "http://localhost:5000/api";

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState(""); // "" | "inStock" | "lowStock" | "outOfStock"
  const [sort, setSort] = useState("newest");

  // Inline Stock Edits tracking object { [productId]: number }
  const [stockEdits, setStockEdits] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Modal State for Quick Adjustment
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      if (search) params.append("search", search);
      if (stockStatus) params.append("stockStatus", stockStatus);
      if (sort) params.append("sort", sort);

      const response = await fetch(`${API_URL}/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || (data.products ? data.products.length : 0));

        // Initialize inline stock state
        const initialEdits = {};
        (data.products || []).forEach((p) => {
          initialEdits[p._id] = p.stock;
        });
        setStockEdits(initialEdits);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, stockStatus, sort]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleStockInputChange = (id, val) => {
    setStockEdits((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleSaveStock = async (product) => {
    const newStock = Number(stockEdits[product._id]);

    if (isNaN(newStock) || newStock < 0) {
      alert("Stock cannot be negative!");
      return;
    }

    setUpdatingId(product._id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/products/${product._id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update product locally
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p))
        );
      } else {
        alert(data.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Stock update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const openAdjustModal = (product) => {
    setSelectedProduct(product);
    setAdjustAmount("");
    setShowAdjustModal(true);
  };

  const handleQuickAdjust = async (delta) => {
    if (!selectedProduct) return;
    const currentStock = selectedProduct.stock;
    const newStock = currentStock + delta;

    if (newStock < 0) {
      alert("Stock cannot fall below zero!");
      return;
    }

    setUpdatingId(selectedProduct._id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/products/${selectedProduct._id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowAdjustModal(false);
        setSelectedProduct(null);
        fetchInventory();
      } else {
        alert(data.message || "Adjustment failed");
      }
    } catch (error) {
      console.error("Stock adjust error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-inventory-container">
      {/* Header */}
      <div className="admin-inventory-header">
        <div>
          <h1>Inventory & Stock Control</h1>
          <p>Monitor real-time warehouse stock levels, adjust inventory, and manage alerts</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search inventory by product name, category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <select
            className="admin-select"
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stock Statuses</option>
            <option value="lowStock">⚠️ Low Stock (1 - 10)</option>
            <option value="outOfStock">❌ Out of Stock (0)</option>
            <option value="inStock">✅ In Stock (&gt; 10)</option>
          </select>

          <select
            className="admin-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Sort by: Newest Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Quick Edit Stock</th>
                <th>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading warehouse inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No products found matching stock filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isOut = product.stock === 0;
                  const isLow = product.stock > 0 && product.stock <= 10;
                  const rowClass = isOut ? "row-out-stock" : isLow ? "row-low-stock" : "";

                  return (
                    <tr key={product._id} className={rowClass}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-img-thumb"
                          />
                          <div>
                            <strong>{product.name}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                              {product.brand || "Generic"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>₹{product.price?.toLocaleString()}</td>
                      <td>
                        <strong style={{ fontSize: "1rem" }}>{product.stock}</strong> units
                      </td>
                      <td>
                        {isOut ? (
                          <span className="badge-out-stock">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge-low-stock">Low Stock ({product.stock})</span>
                        ) : (
                          <span className="badge-status badge-delivered">In Stock</span>
                        )}
                      </td>
                      <td>{new Date(product.updatedAt || product.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="inventory-inline-stock">
                          <input
                            type="number"
                            min="0"
                            className="input-stock-inline"
                            value={stockEdits[product._id] ?? product.stock}
                            onChange={(e) => handleStockInputChange(product._id, e.target.value)}
                          />
                          <button
                            className="btn-stock-save"
                            disabled={updatingId === product._id}
                            onClick={() => handleSaveStock(product)}
                          >
                            {updatingId === product._id ? "..." : "Save"}
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-stock-quick"
                          onClick={() => openAdjustModal(product)}
                        >
                          ⚡ Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-container">
          <span className="pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalProducts} items)
          </span>
          <div className="pagination-buttons">
            <button
              className="btn-page"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`btn-page ${pageNum === page ? "active" : ""}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="btn-page"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Quick Adjust Stock Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title">⚡ Quick Stock Adjustment</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowAdjustModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontWeight: 600 }}>{selectedProduct.name}</p>
              <p style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                Current Warehouse Stock: <strong>{selectedProduct.stock} units</strong>
              </p>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  className="btn-page"
                  onClick={() => handleQuickAdjust(10)}
                  style={{ flex: 1, padding: "0.6rem" }}
                >
                  +10 Restock
                </button>
                <button
                  type="button"
                  className="btn-page"
                  onClick={() => handleQuickAdjust(50)}
                  style={{ flex: 1, padding: "0.6rem" }}
                >
                  +50 Shipment
                </button>
                <button
                  type="button"
                  className="btn-page"
                  onClick={() => handleQuickAdjust(-5)}
                  style={{ flex: 1, padding: "0.6rem", color: "var(--admin-danger)" }}
                >
                  -5 Write-off
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAdjustModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
