import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_STORAGE_KEY = 'expense_app_token';
export const USER_STORAGE_KEY = 'expense_app_user';

export const setToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const setUser = async (user) => {
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearUser = async () => {
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export const logout = async () => {
  await clearToken();
  await clearUser();
};
