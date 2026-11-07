
import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { initiativesService } from '../../api/services/initiatives.js'
import { projectsService } from '../../api/services/projects.js'
import PageHeader from '../../components/PageHeader.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { useApiQuery } from '../../hooks/useApiQuery.js'
import { isInitiativeId } from '../initiatives/detail.js'
import {
  initialProject,
  validateProject,
} from './project-form.js'

const notEmpty = () => false

function Form({ initiative }) {
  const navigate = useNavigate()
  const [values, setValues] = useState(initialProject)
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const sending = useRef(false)

  async function submit(event) {
    event.preventDefault()
    if (sending.current) return

    const checked = validateProject(values)
    setErrors(checked.errors)

    if (Object.keys(checked.errors).length) return

    sending.current = true
    setPending(true)
    setFailure('')

    try {
      const result = await projectsService.createFromInitiative(
        initiative.id,
        checked.value,
      )

      navigate(`/proyectos/${result.data.id}`, {
        replace: true,
      })
    } catch (problem) {
      setErrors(problem.fields ?? {})
      setFailure(
        problem.status === 409
          ? 'La iniciativa o sus integrantes cambiaron, o ya existe el proyecto. Verifica la iniciativa antes de reintentar.'
          : problem.message,
      )
    } finally {
      sending.current = false
      setPending(false)
    }
  }

  function field(key, label, {
    textarea = false,
    type = 'text',
    maxLength,
  } = {}) {
    return (
      <div className="mb-3" key={key}>
        <label className="form-label" htmlFor={`project-${key}`}>
          {label}
        </label>

        {textarea ? (
          <textarea
            className="form-control"
            id={`project-${key}`}
            rows={4}
            maxLength={maxLength}
            value={values[key]}
            onChange={(event) =>
              setValues((v) => ({
                ...v,
                [key]: event.target.value,
              }))
            }
          />
        ) : (
          <input
            className="form-control"
            id={`project-${key}`}
            type={type}
            maxLength={maxLength}
            value={values[key]}
            onChange={(event) =>
              setValues((v) => ({
                ...v,
                [key]: event.target.value,
              }))
            }
          />
        )}

        {errors[key] ? (
          <p className="text-danger small" role="alert">
            {errors[key]}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form
      className="card card-body p-4"
      onSubmit={submit}
      noValidate
      aria-busy={pending}
    >
      <p>
        Iniciativa de origen: <strong>{initiative.title}</strong>
        {' · '}{initiative.memberCount} miembros activos
      </p>

      {failure ? (
        <StatusPanel title="No se pudo convertir" variant="error">
          <p>{failure}</p>
        </StatusPanel>
      ) : null}

      {field('name', 'Nombre del proyecto', {
        maxLength: 120,
      })}

      {field('description', 'Descripción', {
        textarea: true,
        maxLength: 2000,
      })}

      {field('objective', 'Objetivo', {
        textarea: true,
        maxLength: 500,
      })}

      {field(
        'technologies',
        'Tecnologías (separadas por comas)',
      )}

      {field('startDate', 'Fecha de inicio', {
        type: 'date',
      })}

      {field('estimatedEndDate', 'Fecha estimada de fin (opcional)', {
        type: 'date',
      })}

      {field('repositoryUrl', 'URL del repositorio (opcional)', {
        type: 'url',
        maxLength: 2048,
      })}

      <p className="text-secondary small">
        El equipo permanece vinculado a la iniciativa.
        La conversión no puede deshacerse desde esta entrega.
      </p>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending}
        >
          {pending ? 'Convirtiendo…' : 'Crear proyecto'}
        </button>
        <Link
          to={`/iniciativas/${initiative.id}`}
          className="btn btn-outline-secondary"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}

export function ProjectConvertPage() {
  const { id } = useParams()

  const load = useCallback(
    ({ signal }) => initiativesService.getById(id, { signal }),
    [id],
  )

  const query = useApiQuery({
    queryKey: `convert:${id}`,
    queryFn: load,
    enabled: isInitiativeId(id),
    isEmpty: notEmpty,
  })

  return (
    <>
      <PageHeader
        eyebrow="Proyectos"
        title="Convertir iniciativa en proyecto"
      />

      {!isInitiativeId(id) ? (
        <StatusPanel variant="error" title="Identificador inválido">
          <p>Verifica la dirección.</p>
        </StatusPanel>
      ) : null}

      {['loading', 'idle'].includes(query.status) &&
       isInitiativeId(id) ? (
        <StatusPanel title="Comprobando iniciativa">
          <p>Validando permisos y miembros.</p>
        </StatusPanel>
      ) : null}

      {query.status === 'error' ? (
        <StatusPanel
          title="No se pudo consultar"
          variant="error"
          action={
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={query.retry}
            >
              Reintentar
            </button>
          }
        >
          <p>{query.error.message}</p>
        </StatusPanel>
      ) : null}

      {query.status === 'success' &&
       query.data.data.access?.canConvert !== true ? (
        <StatusPanel
          variant="warning"
          title="Conversión no disponible"
        >
          <p>
            El propietario necesita al menos otro miembro activo
            y la iniciativa debe estar publicada o formando equipo.
          </p>
          <Link to={`/iniciativas/${id}`}>
            Volver al detalle
          </Link>
        </StatusPanel>
      ) : null}

      {query.status === 'success' &&
       query.data.data.access?.canConvert === true ? (
        <Form initiative={query.data.data} />
      ) : null}
    </>
  )
}
