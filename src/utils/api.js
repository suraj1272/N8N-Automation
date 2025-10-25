import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Generic API call function with automatic logout on 401
export const apiCall = async (url, options = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // If 401 Unauthorized, token is expired or invalid
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Token expired or invalid');
    }

    return response;
  } catch (error) {
    if (error.message === 'Token expired or invalid') {
      throw error;
    }
    throw new Error(`API call failed: ${error.message}`);
  }
};

// Convenience methods
export const api = {
  get: (url) => apiCall(url, { method: 'GET' }),
  post: (url, data) => apiCall(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => apiCall(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url) => apiCall(url, { method: 'DELETE' }),
};
