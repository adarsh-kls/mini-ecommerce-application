import { useEffect, useState, useCallback } from "react";
import "../../styles/adminProducts.css";
import "../../styles/adminReviews.css";

const API_URL = "http://localhost:5000/api";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  // Modal State
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      if (search) params.append("search", search);
      if (ratingFilter && ratingFilter !== "All") params.append("rating", ratingFilter);

      const response = await fetch(`${API_URL}/reviews/admin/all?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
        setTotalReviews(data.totalReviews || (data.reviews ? data.reviews.length : 0));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reviews/admin/${reviewToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setReviewToDelete(null);
        fetchReviews();
      } else {
        alert(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="admin-reviews-container">
      {/* Header */}
      <div className="admin-reviews-header">
        <div>
          <h1>Review Moderation & Ratings</h1>
          <p>Audit customer product feedback, filter ratings, and remove inappropriate content</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search review comments..."
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
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All Star Ratings</option>
            <option value="5">5 Stars (★ ★ ★ ★ ★)</option>
            <option value="4">4 Stars (★ ★ ★ ★ ☆)</option>
            <option value="3">3 Stars (★ ★ ★ ☆ ☆)</option>
            <option value="2">2 Stars (★ ★ ☆ ☆ ☆)</option>
            <option value="1">1 Star  (★ ☆ ☆ ☆ ☆)</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    Loading product reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    No reviews found matching search filters.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img
                          src={rev.product?.image || "https://via.placeholder.com/40"}
                          alt={rev.product?.name}
                          className="product-img-thumb"
                        />
                        <div>
                          <strong>{rev.product?.name || "Deleted Product"}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{rev.user?.name || "Anonymous User"}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                        {rev.user?.email}
                      </div>
                    </td>
                    <td>
                      <span className="star-rating-display">
                        {renderStars(rev.rating)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 320 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--admin-text-main)" }}>
                        "{rev.comment}"
                      </p>
                    </td>
                    <td>{new Date(rev.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => openDeleteModal(rev)}
                      >
                        Delete Review
                      </button>
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
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalReviews} total reviews)
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

      {/* Delete Review Modal */}
      {showDeleteModal && reviewToDelete && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title">🗑️ Moderation: Delete Review</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowDeleteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to remove this review by{" "}
                <strong>"{reviewToDelete.user?.name}"</strong> for{" "}
                <strong>"{reviewToDelete.product?.name}"</strong>?
              </p>
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: 6,
                  margin: "0.75rem 0",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}
              >
                "{reviewToDelete.comment}"
              </div>
              <p style={{ color: "var(--admin-danger)", fontSize: "0.85rem" }}>
                Deleting this review will automatically recalculate the overall product rating in the store.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDeleteReview}>
                Confirm Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;
