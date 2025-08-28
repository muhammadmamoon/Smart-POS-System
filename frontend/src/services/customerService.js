import API from "./api";

export const getCustomers = async () => {
  const { data } = await API.get("/customers");
  return data;
};

export const addCustomer = async (customer) => {
  const { data } = await API.post("/customers", customer);
  return data;
};

export const updateCustomer = async (id, customer) => {
  const { data } = await API.put(`/customers/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id) => {
  const { data } = await API.delete(`/customers/${id}`);
  return data;
};
