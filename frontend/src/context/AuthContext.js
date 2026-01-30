import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem('refreshToken')
  );

  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 &&
            error.response?.data?.expired === true &&
            !originalRequest._retry) {

          originalRequest._retry = true;

          try {
            const response = await axios.post('/api/auth/refresh', {
              refreshToken: localStorage.getItem('refreshToken')
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);

            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка авторизации'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка регистрации'
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const fetchUser = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      if (!error.response?.data?.expired) {
        console.error('Ошибка при получении пользователя:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [accessToken]);

  const value = {
    user,
    loading,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};