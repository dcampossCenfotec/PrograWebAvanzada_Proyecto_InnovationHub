import { apiClient } from '../client.js'

export const usersService = {
  list: (query, options) => apiClient.get('/users', { ...options, query }),
  getById: (id, options) => apiClient.get(`/users/${id}`, options),
  updateMe: (values, options) => apiClient.put('/users/me', values, options),
}
