// Environment URLs taken directly from mernCreditCard/app/mernEndpoints/environments/
export const API_ENVIRONMENTS = {
  production: {
    key: 'production',
    label: 'Production (mern.teedlej.com)',
    baseUrl: 'https://mern.teedlej.com',
  },
  local: {
    key: 'local',
    label: 'Local Express API',
    baseUrl: 'http://localhost:5000',
  },
};

const STORAGE_ENV_KEY = 'spendsignal_api_env_v2';
const STORAGE_TOKEN_KEY = 'spendsignal_token';

export function getApiEnvKey() {
  const saved = localStorage.getItem(STORAGE_ENV_KEY);
  if (saved && API_ENVIRONMENTS[saved]) {
    return saved;
  }
  return 'production';
}

export function setApiEnvKey(envKey) {
  if (API_ENVIRONMENTS[envKey]) {
    localStorage.setItem(STORAGE_ENV_KEY, envKey);
  }
}

export function getApiBaseUrl() {
  const envKey = getApiEnvKey();
  return API_ENVIRONMENTS[envKey]?.baseUrl || API_ENVIRONMENTS.production.baseUrl;
}

async function request(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const startTime = performance.now();
  const response = await fetch(url, {
    ...options,
    headers,
  });
  const durationMs = Math.round(performance.now() - startTime);

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.payload = data;
    error.durationMs = durationMs;
    error.url = url;
    throw error;
  }

  return {
    status: response.status,
    data,
    durationMs,
    url,
  };
}

// GET /api/ping -> defined in app/routes/index.js
export async function pingBackend() {
  return request('/api/ping', { method: 'GET' });
}

// POST /api/users/login -> defined in app/routes/users.js & app/controllers/userController.js
export async function loginUser({ username, password }) {
  return request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// POST /api/users/create -> defined in app/routes/users.js & app/controllers/userController.js
export async function registerUser({ firstName, lastName, username, password, email }) {
  return request('/api/users/create', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, username, password, email }),
  });
}

// GET /api/users/:userId -> defined in app/routes/users.js & app/controllers/userController.js
export async function fetchUserById(userId) {
  return request(`/api/users/${userId}`, {
    method: 'GET',
  });
}

// GET /api/cards?page=1&limit=10 -> defined in app/routes/cards.js & app/controllers/cardController.js
export async function fetchUserCards({ page = 1, limit = 10 } = {}) {
  return request(`/api/cards?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
}

// GET /api/cards/:cardId -> defined in app/routes/cards.js & app/controllers/cardController.js
export async function fetchCardById(cardId) {
  return request(`/api/cards/${cardId}`, {
    method: 'GET',
  });
}

// POST /api/cards -> defined in app/routes/cards.js & app/controllers/cardController.js
export async function createUserCard(cardPayload) {
  return request('/api/cards', {
    method: 'POST',
    body: JSON.stringify(cardPayload),
  });
}
