import API from "./api";

export const login = async (credentials) => {
  const { data } = await API.post("/auth/login", credentials);
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

export const register = async (userInfo) => {
  const { data } = await API.post("/auth/register", userInfo);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
