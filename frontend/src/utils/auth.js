// utils/auth.js
const BASE_URL = 'http://localhost:3000';

export const register = (email, password) => {
  return fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then((response) => {
    if (!response.ok) {
      return response.json().then(err => {
        console.error('❌ Register error:', err);
        return Promise.reject({
          status: response.status,
          message: err.message || 'Error en el registro',
          ...err
        });
      });
    }
    return response.json();
  })
  .then(data => {
    return data;
  });
};

export const login = (email, password) => {
  return fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then((response) => {
    if (!response.ok) {
      return response.json().then(err => {
        console.error('❌ Login error:', err);
        return Promise.reject({
          status: response.status,
          message: err.message || 'Error en el login',
          ...err
        });
      });
    }
    return response.json();
  })
  .then(data => {
    return data;
  });
};

export const checkToken = (token) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then((response) => {
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err));
    }
    return response.json();
  });
};