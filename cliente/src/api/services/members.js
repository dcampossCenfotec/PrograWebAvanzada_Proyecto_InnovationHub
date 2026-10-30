import { apiClient } from '../client.js'

export const membersService = {
  list: (initiativeId, query, options) =>
    apiClient.get(`/initiatives/${initiativeId}/members`, { ...options, query }),
  remove: (initiativeId, userId, options) =>
    apiClient.delete(`/initiatives/${initiativeId}/members/${userId}`, options),
}
