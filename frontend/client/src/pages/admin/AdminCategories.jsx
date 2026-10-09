import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";
import "../../styles/adminCategories.css";

const API_URL = "http://localhost:5000/api";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignCategory, setReassignCategory] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    description: "",
    image: "",
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const url = search
        ? `${API_URL}/categories?search=${encodeURIComponent(search)}`
        : `${API_URL}/categories`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ _id: null, name: "", description: "", image: "" });
    setShowFormModal(true);
  };

  const openEditModal = (cat) => {
    setModalMode("edit");
    setFormData({
      _id: cat._id,
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
    });
    setShowFormModal(true);
  };

  const openDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setReassignCategory("");
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url =
        modalMode === "add"
          ? `${API_URL}/categories`
          : `${API_URL}/categories/${formData._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowFormModal(false);
        fetchCategories();
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Category submit error:", error);
    }
  };

  const confirmDeleteCategory = async (forceDelete = false) => {
    if (!categoryToDelete) return;
    try {
      const token = localStorage.getItem("token");
      let url = `${API_URL}/categories/${categoryToDelete._id}`;
      const params = new URLSearchParams();

      if (reassignCategory) {
        params.append("reassignCategory", reassignCategory);
      } else if (forceDelete) {
        params.append("force", "true");
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else if (data.hasProducts) {
        alert(
          `Cannot delete category directly: ${data.productCount} product(s) are assigned to it. Choose a category to reassign products or force delete.`
        );
      } else {
        alert(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete category error:", error);
    }
  };

  return (
    <div className="admin-categories-container">
      {/* Header */}
      <div className="admin-categories-header">
        <div>
          <h1>Category Management</h1>
          <p>Organize products into categories and maintain store structure</p>
        </div>
        <button className="btn-create-product" onClick={openAddModal}>
          <span>🏷️</span> Add New Category
        </button>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-group" style={{ maxWidth: 400 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table Card */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Attached Products</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No categories found. Create your first category above!
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <img
                        src={
                          cat.image ||
                          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150"
                        }
                        alt={cat.name}
                        className="product-img-thumb"
                      />
                    </td>
                    <td>
                      <strong>{cat.name}</strong>
                    </td>
                    <td>
                      <code style={{ color: "var(--admin-primary)" }}>{cat.slug}</code>
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {cat.description || "—"}
                    </td>
                    <td>
                      <span className="category-badge-count">
                        {cat.productCount || 0} product(s)
                      </span>
                    </td>
                    <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => openEditModal(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => openDeleteModal(cat)}
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
      </div>

      {/* Form Modal (Add / Edit) */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === "add" ? "🏷️ Add New Category" : "✏️ Edit Category"}
              </h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowFormModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Electronics, Fashion, Footwear..."
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of items in this category..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Image / Banner URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/..."
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
                  {modalMode === "add" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Delete Modal with Product Handling */}
      {showDeleteModal && categoryToDelete && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete Category</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete category{" "}
                <strong>"{categoryToDelete.name}"</strong>?
              </p>

              {categoryToDelete.productCount > 0 ? (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ color: "#fbbf24", fontWeight: 600, margin: 0 }}>
                    ⚠️ Notice: {categoryToDelete.productCount} product(s) are currently in this category.
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", marginTop: "0.5rem" }}>
                    Select a target category to reassign these products to:
                  </p>
                  <select
                    className="admin-select"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                    value={reassignCategory}
                    onChange={(e) => setReassignCategory(e.target.value)}
                  >
                    <option value="">-- Do not reassign (Mark Uncategorized) --</option>
                    {categories
                      .filter((c) => c._id !== categoryToDelete._id)
                      .map((c) => (
                        <option key={c._id} value={c.name}>
                          Reassign to {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <p style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  This category currently has no attached products. It will be removed immediately.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => confirmDeleteCategory(categoryToDelete.productCount > 0 && !reassignCategory)}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
