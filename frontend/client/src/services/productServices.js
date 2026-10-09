const API_URL = "http://localhost:5000/api/products";

export const getProducts = async ({
  search = "",
  category = "All",
  sort = "newest",
  page = 1,
  limit = 8,
} = {}) => {

  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (category && category !== "All") {
    params.append("category", category);
  }

  params.append("sort", sort);
  params.append("page", page);
  params.append("limit", limit);

  const response = await fetch(
    `${API_URL}?${params.toString()}`
  );

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