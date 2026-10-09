const API_URL = "http://localhost:5000/api/address";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const getAddresses = async () => {
    const response = await fetch(`${API_URL}/`, {
        headers: getHeaders()
    });
    if (!response.ok) {
        throw new Error("Failed to fetch addresses");
    }
    return response.json();
};

export const getAddressById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: getHeaders()
    });
    if (!response.ok) {
        throw new Error("Failed to fetch address");
    }
    return response.json();
};

export const addAddress = async (addressData) => {
    const response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(addressData)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add address");
    }
    return response.json();
};

export const updateAddress = async (id, addressData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(addressData)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update address");
    }
    return response.json();
};

export const deleteAddress = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete address");
    }
    return response.json();
};
