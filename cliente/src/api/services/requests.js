import { apiClient } from '../client.js'

export const requestsService = {
  list: (query, options) => apiClient.get('/requests', { ...options, query }),
  getById: (id, options) => apiClient.get(`/requests/${id}`, options),
  update: (id, values, options) => apiClient.put(`/requests/${id}`, values, options),
  cancel: (id, options) => apiClient.post(`/requests/${id}/cancel`, undefined, options),
  decide: (id, values, options) =>
    apiClient.post(`/requests/${id}/decision`, values, options),
}
