import api from './client';

export const authAPI = {
  register: async ({ email, phoneNumber, password }) => {
    const res = await api.post('auth/register', {
      applicationId: 'expense-app',
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      password,
      role: 'USER',
    });
    return res.data;
  },

  login: async ({ identifier, password }) => {
    const res = await api.post('auth/login', {
      applicationId: 'expense-app',
      identifier,
      password,
    });
    return res.data;
  },

  forgotPassword: async (identifier) => {
    const res = await api.post('auth/forgot-password', {
      applicationId: 'expense-app',
      identifier,
    });
    return res.data;
  },

  resetPassword: async (identifier, newPassword) => {
    const res = await api.post('auth/reset-password', {
      applicationId: 'expense-app',
      identifier,
      newPassword,
    });
    return res.data;
  },
};
