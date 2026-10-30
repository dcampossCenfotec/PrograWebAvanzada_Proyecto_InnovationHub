import { createHealthDto } from '../dto/health.dto.js'

export function createHealthController(healthService) {
  return {
    getHealth(_request, response) {
      response.status(200).json(createHealthDto(healthService.getStatus()))
    },
  }
}
