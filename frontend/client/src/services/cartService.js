const API_URL = "http://localhost:5000/api/cart";

const getToken = (t) => (typeof t === "string" && t.length > 20 ? t : localStorage.getItem("token") || "");

export const getCart = async (token) => {
    const tokenToUse = getToken(token);
    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${tokenToUse}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch cart");
    }

    return data;
};

export const addToCart = async (arg1, arg2, arg3) => {
    let token, productId, quantity;

    if (typeof arg1 === "string" && arg1.length > 20 && typeof arg2 === "string") {
        token = arg1;
        productId = arg2;
        quantity = arg3;
    } else {
        productId = arg1;
        quantity = arg2;
        token = arg3;
    }

    const tokenToUse = getToken(token);

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
            productId,
            quantity
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to add product to cart");
    }

    return data;
};

export const updateCartItem = async (arg1, arg2, arg3) => {
    let token, productId, quantity;

    if (typeof arg1 === "string" && arg1.length > 20 && typeof arg2 === "string") {
        token = arg1;
        productId = arg2;
        quantity = arg3;
    } else {
        productId = arg1;
        quantity = arg2;
        token = arg3;
    }

    const tokenToUse = getToken(token);

    const response = await fetch(`${API_URL}/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
            quantity
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update cart");
    }

    return data;
};

export const removeFromCart = async (arg1, arg2) => {
    let token, productId;

    if (typeof arg1 === "string" && arg1.length > 20 && typeof arg2 === "string") {
        token = arg1;
        productId = arg2;
    } else {
        productId = arg1;
        token = arg2;
    }

    const tokenToUse = getToken(token);

    const response = await fetch(`${API_URL}/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${tokenToUse}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to remove product");
    }

    return data;
};

export const clearCart = async (token) => {
    const tokenToUse = getToken(token);

    const response = await fetch(`${API_URL}/clear`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${tokenToUse}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to clear cart");
    }

    return data;
};