import API from "./api";

export const getSales = async () => {
  const { data } = await API.get("/sales");
  return data;
};

export const createSale = async (saleData) => {
  const { data } = await API.post("/sales", saleData);
  return data;
};

export const getSaleById = async (id) => {
  const { data } = await API.get(`/sales/${id}`);
  return data;
};

export const deleteSale = async (id) => {
  const { data } = await API.delete(`/sales/${id}`);
  return data;
};
