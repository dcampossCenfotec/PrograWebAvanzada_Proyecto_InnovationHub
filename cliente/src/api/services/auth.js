import { apiClient } from '../client.js'

export const authService = {
  register: (values, options) => apiClient.post('/auth/register', values, options),
  login: (values, options) => apiClient.post('/auth/login', values, options),
  logout: (options) => apiClient.post('/auth/logout', undefined, options),
  getMe: (options) => apiClient.get('/auth/me', options),
}
