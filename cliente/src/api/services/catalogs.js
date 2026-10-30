import { apiClient } from '../client.js'

export const catalogsService = {
  listCategories: (options) => apiClient.get('/categories', options),
  listSkills: (query, options) => apiClient.get('/skills', { ...options, query }),
}
