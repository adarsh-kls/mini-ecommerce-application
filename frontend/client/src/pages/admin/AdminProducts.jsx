import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";

const API_URL = "http://localhost:5000/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("");
  const [sort, setSort] = useState("newest");

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    image: "",
    stock: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 8);
      if (search) params.append("search", search);
      if (category && category !== "All") params.append("category", category);
      if (stockStatus) params.append("stockStatus", stockStatus);
      if (sort) params.append("sort", sort);

      const response = await fetch(`${API_URL}/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || (data.products ? data.products.length : 0));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, stockStatus, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      _id: null,
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      image: "",
      stock: "",
    });
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setModalMode("edit");
    setFormData({ ...product });
    setShowFormModal(true);
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = modalMode === "add" ? `${API_URL}/products` : `${API_URL}/products/${formData._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        brand: formData.brand,
        image: formData.image,
        stock: Number(formData.stock),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setShowFormModal(false);
        fetchProducts();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/products/${productToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const categoriesList = ["All", "Electronics", "Clothing", "Footwear", "Accessories", "Home", "Books"];

  return (
    <div className="admin-products-container">
      {/* Header */}
      <div className="admin-products-header">
        <div>
          <h1>Product Catalog Management</h1>
          <p>Create, update, search, and manage inventory products</p>
        </div>
        <button className="btn-create-product" onClick={openAddModal}>
          <span>➕</span> Add New Product
        </button>
      </div>

      {/* Controls Bar: Search, Filters & Sorting */}
      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products by name, brand, category..."
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
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Categories</option>
            {categoriesList.filter((c) => c !== "All").map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="admin-select"
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stock Status</option>
            <option value="inStock">In Stock (&gt; 10)</option>
            <option value="lowStock">Low Stock (1 - 10)</option>
            <option value="outOfStock">Out of Stock (0)</option>
          </select>

          <select
            className="admin-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)" }}>
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.image || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="product-img-thumb"
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.brand || "Generic"}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price?.toLocaleString()}</td>
                    <td>
                      {product.stock === 0 ? (
                        <span className="badge-out-stock">0 (Out of Stock)</span>
                      ) : product.stock <= 10 ? (
                        <span className="badge-low-stock">{product.stock} (Low Stock)</span>
                      ) : (
                        <span>{product.stock}</span>
                      )}
                    </td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => openViewModal(product)}
                        >
                          View
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => openDeleteModal(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pagination-container">
          <span className="pagination-info">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalProducts} total products)
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

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === "add" ? "✨ Add New Product" : "✏️ Edit Product"}
              </h2>
              <button className="btn-close-modal" onClick={() => setShowFormModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Wireless Headphones Pro"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter detailed product specs and features..."
                  ></textarea>
                </div>

                <div className="modal-grid-2">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="2999"
                    />
                  </div>

                  <div className="form-group">
                    <label>Initial Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="modal-grid-2">
                  <div className="form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      placeholder="Electronics"
                    />
                  </div>

                  <div className="form-group">
                    <label>Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      placeholder="Sony"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {modalMode === "add" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {showViewModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2 className="modal-title">📦 Product Overview</h2>
              <button className="btn-close-modal" onClick={() => setShowViewModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: 160, height: 160, borderRadius: 12, objectFit: "cover", border: "1px solid var(--admin-border)" }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{selectedProduct.name}</h3>
                <p style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>{selectedProduct.description}</p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                  <span>Price: <strong>₹{selectedProduct.price}</strong></span>
                  <span>Stock: <strong>{selectedProduct.stock}</strong></span>
                  <span>Category: <strong>{selectedProduct.category}</strong></span>
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.2rem", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                  <span>Brand: {selectedProduct.brand}</span>
                  <span>Rating: ⭐ {selectedProduct.rating} ({selectedProduct.numReviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Confirm Delete</h2>
              <button className="btn-close-modal" onClick={() => setShowDeleteModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete <strong>"{productToDelete.name}"</strong>?
              </p>
              <p style={{ color: "var(--admin-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                This action cannot be undone and will remove the item from the catalog.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDeleteProduct}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
