import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

// Attach access token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('bazario_user');
  if (user) {
    const { accessToken } = JSON.parse(user);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────
// SINGLE-FLIGHT TOKEN REFRESH
//
// Problem this solves:
// Pages like the vendor dashboard fire MULTIPLE api calls at once
// (e.g. Promise.all([api.get('/vendors/me'), api.get('/orders/vendor')])).
// If the access token has expired, BOTH requests get a 401 at nearly the
// same moment. Without this fix, EACH request independently tries to
// call /auth/refresh — two refresh attempts racing each other. Whichever
// one's new refresh-token gets saved last can invalidate the other,
// causing one of the two original requests to fail silently while the
// other succeeds. That's why pages would randomly show partial or empty
// data after a hard refresh.
//
// Fix: track ONE in-flight refresh promise. If a second request also
// hits a 401 while a refresh is already happening, it just waits for
// that SAME promise instead of starting a brand new refresh call.
// ─────────────────────────────────────────────────────────────────────────
let refreshPromise = null;

function refreshAccessToken() {
  // If a refresh is already in progress, reuse it instead of starting another
  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        const user = JSON.parse(localStorage.getItem('bazario_user') || '{}');
        user.accessToken = data.accessToken;
        localStorage.setItem('bazario_user', JSON.stringify(user));
        return data.accessToken;
      })
      .finally(() => {
        // Clear it once it settles (success OR failure) so the NEXT
        // expired-token cycle in the future can trigger a fresh refresh.
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original); // retry the original request with the fresh token
      } catch (refreshErr) {
        localStorage.removeItem('bazario_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
