// Always run against the Production server
export const API_BASE_URL = 'https://mern.teedlej.com';

// Allowed transaction categories matching backend schema
export const TRANSACTION_CATEGORIES = [
  'Groceries',
  'Gas',
  'Dining',
  'Travel',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Other',
];

// Canonical Card Products from database seed
export const DEFAULT_CARD_PRODUCTS = [
  {
    name: 'Everyday Cash',
    network: 'Visa',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { Groceries: 0.03, Gas: 0.03 },
    defaultApr: 19.99,
    defaultLimit: 5000,
  },
  {
    name: 'Travel Rewards',
    network: 'Mastercard',
    annualFee: 95,
    baseRate: 0.015,
    categoryRates: { Travel: 0.04, Dining: 0.03 },
    defaultApr: 22.49,
    defaultLimit: 10000,
  },
  {
    name: 'Student Starter',
    network: 'Visa',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { Dining: 0.02, Shopping: 0.02 },
    defaultApr: 24.99,
    defaultLimit: 1500,
  },
  {
    name: 'Platinum',
    network: 'Amex',
    annualFee: 695,
    baseRate: 0.01,
    categoryRates: { Travel: 0.05, Dining: 0.02 },
    defaultApr: 17.99,
    defaultLimit: 15000,
  },
  {
    name: 'Dining Plus',
    network: 'Visa',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { Dining: 0.05, Entertainment: 0.03 },
    defaultApr: 20.99,
    defaultLimit: 6000,
  },
  {
    name: 'Flat 2% Cash',
    network: 'Mastercard',
    annualFee: 0,
    baseRate: 0.02,
    categoryRates: {},
    defaultApr: 18.99,
    defaultLimit: 8000,
  },
];

const STORAGE_TOKEN_KEY = 'spendsignal_token';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

// Client-side password check matching backend isPasswordValid()
export function validatePasswordRules(password) {
  const str = typeof password === 'string' ? password : '';
  const minLengthOk = str.length >= 8;
  const hasSpecialChar = /[^A-Za-z0-9\s]/.test(str);
  if (!minLengthOk) {
    return {
      valid: false,
      minLengthOk,
      hasSpecialChar,
      error: 'Password must be at least 8 characters long',
    };
  }
  if (!hasSpecialChar) {
    return {
      valid: false,
      minLengthOk,
      hasSpecialChar,
      error: 'Password must contain at least one special character',
    };
  }
  return { valid: true, minLengthOk, hasSpecialChar, error: null };
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
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

// Health check
export async function pingBackend() {
  return request('/api/ping', { method: 'GET' });
}

// --- Users ---

export async function loginUser({ username, password }) {
  return request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function registerUser({ firstName, lastName, username, password, email }) {
  return request('/api/users/create', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, username, password, email }),
  });
}

export async function fetchUserById(userId) {
  return request(`/api/users/${userId}`, {
    method: 'GET',
  });
}

// --- Cards ---

export async function fetchCardProducts() {
  return request('/api/cards/products', {
    method: 'GET',
  });
}

export async function fetchUserCards({ page = 1, limit = 25 } = {}) {
  return request(`/api/cards?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
}

export async function fetchCardById(cardId) {
  return request(`/api/cards/${cardId}`, {
    method: 'GET',
  });
}

export async function createUserCard(cardPayload) {
  return request('/api/cards', {
    method: 'POST',
    body: JSON.stringify(cardPayload),
  });
}

export async function deleteUserCard(cardId) {
  return request(`/api/cards/${cardId}`, {
    method: 'DELETE',
  });
}

// --- Transactions ---

export async function fetchUserTransactions({ page = 1, limit = 25 } = {}) {
  return request(`/api/transactions?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
}

export async function fetchTransactionById(transId) {
  return request(`/api/transactions/${transId}`, {
    method: 'GET',
  });
}

export async function createUserTransaction({ merchant, category, amount, cardId }) {
  return request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({ merchant, category, amount, cardId }),
  });
}

export async function deleteUserTransaction(transId) {
  return request(`/api/transactions/${transId}`, {
    method: 'DELETE',
  });
}

// --- Admin ---

export async function fetchAdminUsers() {
  return request('/api/admin', {
    method: 'GET',
  });
}

export async function createAdminAccount({ firstName, lastName, username, password, email }) {
  return request('/api/admin/createAdmin', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, username, password, email }),
  });
}

export async function createCompanyAccount({
  firstName,
  lastName,
  username,
  password,
  email,
  companyName,
}) {
  return request('/api/admin/createCompany', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, username, password, email, companyName }),
  });
}

export async function adminChangeUserPassword(userId, password) {
  return request(`/api/admin/users/${userId}/password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
