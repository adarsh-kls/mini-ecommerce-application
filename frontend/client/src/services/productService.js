const API_URL = "http://localhost:5000/api/products";

export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};


export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
};