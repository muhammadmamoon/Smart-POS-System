import API from "./api";

// Fetch all products
export const getProducts = async () => {
  const { data } = await API.get("/products");
  return data;
};

// Add new product
export const addProduct = async (product) => {
  const { data } = await API.post("/products", product);
  return data;
};

// Update product
export const updateProduct = async (id, product) => {
  const { data } = await API.put(`/products/${id}`, product);
  return data;
};

// Delete product
export const deleteProduct = async (id) => {
  const { data } = await API.delete(`/products/${id}`);
  return data;
};
