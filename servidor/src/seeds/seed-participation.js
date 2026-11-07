
import {
  getRequestModels,
  ensureRequestIndexes,
} from '../models/request.models.js'

import {
  getProjectModels,
  ensureProjectIndexes,
} from '../models/project.models.js'

import {
  getInitiativeModels,
} from '../models/initiative.models.js'

import {
  getAuthModels,
} from '../models/auth.models.js'

import {
  getCatalogModels,
} from '../models/catalog.models.js'

import {
  runInTransaction,
} from '../database/transaction.js'

function ensureUniqueIds(items, entity) {
  const ids = items.map(({ id }) => id)

  if (ids.length !== new Set(ids).size) {
    throw new Error(
      `Los fixtures de ${entity} contienen IDs duplicados.`,
    )
  }
}

// Inserción no destructiva: NO reabre solicitudes canceladas/rechazadas
// ni restaura proyectos editados. Los registros ajenos al fixture permanecen.
export async function seedParticipation(connection, {
  requests,
  projects,
}) {
  if (
    !Array.isArray(requests) ||
    !Array.isArray(projects)
  ) {
    throw new TypeError(
      'Se requieren arreglos de solicitudes y proyectos.',
    )
  }

  ensureUniqueIds(requests, 'solicitudes')
  ensureUniqueIds(projects, 'proyectos')

  const { Request } = getRequestModels(connection)
  const { Project } = getProjectModels(connection)
  const { Initiative, Membership } = getInitiativeModels(connection)
  const { User } = getAuthModels(connection)
  const { Skill } = getCatalogModels(connection)

  await ensureRequestIndexes({ Request })
  await ensureProjectIndexes({ Project })

  const inserted = {
    requests: 0,
    projects: 0,
  }

  await runInTransaction(connection, async (session) => {
    for (const fixture of requests) {
      // MongoDB no admite operaciones paralelas dentro
      // de una misma sesión transaccional.
      const initiative = await Initiative
        .findOne({ id: fixture.initiativeId })
        .session(session)
        .lean()

      const user = await User
        .findOne({ id: fixture.applicantId })
        .session(session)
        .lean()

      const skill = await Skill
        .findOne({ id: fixture.offeredSkillId })
        .session(session)
        .lean()

      if (!initiative || !user || !skill) {
        throw new Error(
          `Solicitud fixture ${fixture.id}: relación inexistente.`,
        )
      }

      const result = await Request.updateOne(
        { id: fixture.id },
        { $setOnInsert: fixture },
        {
          upsert: true,
          runValidators: true,
          session,
        },
      )

      inserted.requests += result.upsertedCount
    }

    for (const fixture of projects) {
      const initiative = await Initiative.findOne({
        id: fixture.sourceInitiativeId,
      })
        .session(session)
        .lean()

      if (
        !initiative ||
        initiative.ownerId !== fixture.ownerId ||
        initiative.state !== 'converted'
      ) {
        throw new Error(
          `Proyecto fixture ${fixture.id}: origen o propietario incompatible.`,
        )
      }

      const members = await Membership.countDocuments({
        initiativeId: initiative.id,
        state: 'active',
      }).session(session)

      if (members < 2) {
        throw new Error(
          `Proyecto fixture ${fixture.id}: se requiere un segundo integrante activo.`,
        )
      }

      const result = await Project.updateOne(
        { id: fixture.id },
        { $setOnInsert: fixture },
        {
          upsert: true,
          runValidators: true,
          session,
        },
      )

      inserted.projects += result.upsertedCount
    }
  })

  return {
    requests: requests.length,
    projects: projects.length,
    inserted,
  }
}
