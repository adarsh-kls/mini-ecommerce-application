const API_URL = "http://localhost:5000/api/wishlist";

const getToken = (t) => (typeof t === "string" && t.length > 20 ? t : localStorage.getItem("token") || "");

export const getWishlist = async (token) => {
    const tokenToUse = getToken(token);
    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenToUse}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch wishlist");
    }

    return data;
};

export const addToWishlist = async (productId, token) => {
    const tokenToUse = getToken(token);
    const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ productId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add to wishlist");
    }

    return data;
};

export const removeFromWishlist = async (productId, token) => {
    const tokenToUse = getToken(token);
    const response = await fetch(`${API_URL}/remove/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${tokenToUse}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to remove from wishlist");
    }

    return data;
};
