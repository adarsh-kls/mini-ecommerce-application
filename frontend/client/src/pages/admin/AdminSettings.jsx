import { useEffect, useState } from "react";
import "../../styles/adminProducts.css";

const API_URL = "http://localhost:5000/api";

function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: "MERN Tech Store",
    supportEmail: "support@store.com",
    currencySymbol: "₹",
    shippingFee: 50,
    freeShippingThreshold: 1000,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ System settings updated successfully!");
        setSettings(data.settings);
      } else {
        setMessage(`❌ ${data.message || "Failed to save settings"}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("❌ Failed to save system settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading system configuration...</div>;
  }

  return (
    <div className="admin-products-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="admin-products-header">
        <div>
          <h1>Global System Settings</h1>
          <p>Configure store details, currency symbols, shipping rules, and maintenance status</p>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderRadius: 8,
            backgroundColor: message.startsWith("✅")
              ? "rgba(16, 185, 129, 0.15)"
              : "rgba(239, 68, 68, 0.15)",
            border: message.startsWith("✅")
              ? "1px solid rgba(16, 185, 129, 0.4)"
              : "1px solid rgba(239, 68, 68, 0.4)",
            color: message.startsWith("✅") ? "var(--admin-emerald)" : "var(--admin-danger)",
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      {/* Form Card */}
      <div className="table-card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Store Info Section */}
          <div>
            <h3 style={{ margin: "0 0 1rem 0", color: "var(--admin-primary)", borderBottom: "1px solid var(--admin-border)", paddingBottom: "0.5rem" }}>
              🏬 Store Identity
            </h3>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Store Name</label>
              <input
                type="text"
                name="storeName"
                className="admin-input"
                value={settings.storeName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Support Email Address</label>
              <input
                type="email"
                name="supportEmail"
                className="admin-input"
                value={settings.supportEmail}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Financial & Shipping Section */}
          <div>
            <h3 style={{ margin: "1rem 0 1rem 0", color: "var(--admin-primary)", borderBottom: "1px solid var(--admin-border)", paddingBottom: "0.5rem" }}>
              💰 Currency & Shipping Thresholds
            </h3>

            <div className="form-row-2">
              <div className="form-group">
                <label>Currency Symbol</label>
                <input
                  type="text"
                  name="currencySymbol"
                  className="admin-input"
                  value={settings.currencySymbol}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  name="shippingFee"
                  min="0"
                  className="admin-input"
                  value={settings.shippingFee}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Free Shipping Minimum Order Threshold (₹)</label>
              <input
                type="number"
                name="freeShippingThreshold"
                min="0"
                className="admin-input"
                value={settings.freeShippingThreshold}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* System Mode Section */}
          <div>
            <h3 style={{ margin: "1rem 0 1rem 0", color: "var(--admin-primary)", borderBottom: "1px solid var(--admin-border)", paddingBottom: "0.5rem" }}>
              🚨 Store Maintenance Control
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                backgroundColor: settings.maintenanceMode ? "rgba(239, 68, 68, 0.1)" : "rgba(15, 23, 42, 0.6)",
                border: settings.maintenanceMode ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--admin-border)",
                borderRadius: 8,
              }}
            >
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                style={{ width: 20, height: 20, cursor: "pointer" }}
              />
              <label htmlFor="maintenanceMode" style={{ cursor: "pointer", margin: 0 }}>
                <strong>Enable Maintenance Mode</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                  Displays a maintenance banner to customer front-end during store updates
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
              style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
            >
              {saving ? "Saving Changes..." : "💾 Save System Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSettings;
