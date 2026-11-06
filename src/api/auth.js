import api from './client';

export const authAPI = {
  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', {
      applicationId: 'finadvisor-web',
      identifier: email,
      password,
    });
    return res.data;
  },

  googleLogin: async (idToken) => {
    const res = await api.post('/auth/google', {
      applicationId: 'finadvisor-web',
      idToken,
    });
    return res.data;
  },

  forgotPassword: async (identifier) => {
    const res = await api.post('/auth/forgot-password', {
      applicationId: 'finadvisor-web',
      identifier,
    });
    return res.data;
  },

  resetPassword: async (identifier, newPassword) => {
    const res = await api.post('/auth/reset-password', {
      applicationId: 'finadvisor-web',
      identifier,
      newPassword,
    });
    return res.data;
  },
};
