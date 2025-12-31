class Api {
  constructor({ baseUrl }) {
    this._baseUrl = baseUrl;
  }

  // Obtener headers con token JWT
  _getHeaders() {
    const token = localStorage.getItem('jwt');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Verificar respuesta
  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    
    return res.json().then(err => {
      console.error('❌ API Error:', err);
      return Promise.reject({
        status: res.status,
        message: err.message || `Error ${res.status}: ${res.statusText}`,
        ...err
      });
    });
  }

  // Request genérico
  _request(endpoint, options = {}) {
    const url = `${this._baseUrl}${endpoint}`;
    const headers = this._getHeaders();
    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };
    
    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    }
    
    return fetch(url, config).then(this._checkResponse);
  }

  // --------- USUARIOS ---------
  getUserInfo() {
    return this._request('/users/me');
  }

  updateUserInfo({ name, about }) {
    return this._request('/users/me', {
      method: 'PATCH',
      body: { name, about }
    });
  }

  updateAvatar({ avatar }) {
    return this._request('/users/me/avatar', {
      method: 'PATCH',
      body: { avatar }
    });
  }

  // --------- CARDS ---------
  getInitialCards() {
    return this._request('/cards');
  }

  addCard({ name, link }) {
    return this._request('/cards', {
      method: 'POST',
      body: { name, link }
    });
  }

  deleteCard(cardId) {
    return this._request(`/cards/${cardId}`, {
      method: 'DELETE'
    });
  }

  likeCard(cardId) {
    return this._request(`/cards/${cardId}/likes`, {
      method: 'PUT'
    });
  }

  dislikeCard(cardId) {
    return this._request(`/cards/${cardId}/likes`, {
      method: 'DELETE'
    });
  }

  changeLikeCardStatus(cardId, isLiked) {
    return isLiked ? this.dislikeCard(cardId) : this.likeCard(cardId);
  }
}

// Configuración dinámica según el ambiente
const api = new Api({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

export default api;