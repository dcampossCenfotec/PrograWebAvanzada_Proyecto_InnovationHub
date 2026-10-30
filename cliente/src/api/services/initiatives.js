import { apiClient } from '../client.js'

export const initiativesService = {
  list: (query, options) => apiClient.get('/initiatives', { ...options, query }),
  listMine: (query, options) => apiClient.get('/initiatives/mine', { ...options, query }),
  getById: (id, options) => apiClient.get(`/initiatives/${id}`, options),
  create: (values, options) => apiClient.post('/initiatives', values, options),
  update: (id, values, options) =>
    apiClient.put(`/initiatives/${id}`, values, options),
  remove: (id, options) => apiClient.delete(`/initiatives/${id}`, options),
  requestParticipation: (id, values, options) =>
    apiClient.post(`/initiatives/${id}/requests`, values, options),
}
