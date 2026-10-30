import { apiClient } from '../client.js'

export const projectsService = {
  createFromInitiative: (initiativeId, values, options) =>
    apiClient.post(`/initiatives/${initiativeId}/project`, values, options),
  list: (query, options) => apiClient.get('/projects', { ...options, query }),
  getById: (id, options) => apiClient.get(`/projects/${id}`, options),
}
