import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import { getSafeReturnPath, validateLogin } from '../auth/validation.js'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'

const initialValues = { email: '', password: '' }

function LoginPage() {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const submittingRef = useRef(false)
  const [values, setValues] = useState(initialValues)
  const [fields, setFields] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (auth.status === 'authenticated') return <Navigate replace to="/perfil" />

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFields((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submittingRef.current) return
    const validation = validateLogin(values)
    setFields(validation)
    setRequestError(null)
    if (Object.keys(validation).length > 0) return

    submittingRef.current = true
    setSubmitting(true)
    try {
      await auth.login({ email: values.email.trim(), password: values.password })
      navigate(getSafeReturnPath(location.state), { replace: true })
    } catch (error) {
      setFields(error.fields || {})
      setRequestError(error)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <PageHeader
        description="Usa tu cuenta para gestionar iniciativas, solicitudes y perfil."
        eyebrow="Acceso"
        title="Ingresar"
      />

      {requestError ? (
        <StatusPanel title="No fue posible ingresar" variant="error">
          <p>{requestError.message}</p>
        </StatusPanel>
      ) : null}

      <form className="card auth-card shadow-sm" noValidate onSubmit={handleSubmit}>
        <div className="card-body p-4 p-md-5">
          <FormField error={fields.email} id="login-email" label="Correo electrónico">
            {(inputProps) => (
              <input
                {...inputProps}
                autoComplete="email"
                autoFocus
                className={`form-control${fields.email ? ' is-invalid' : ''}`}
                name="email"
                onChange={updateField}
                type="email"
                value={values.email}
              />
            )}
          </FormField>
          <FormField error={fields.password} id="login-password" label="Contraseña">
            {(inputProps) => (
              <input
                {...inputProps}
                autoComplete="current-password"
                className={`form-control${fields.password ? ' is-invalid' : ''}`}
                name="password"
                onChange={updateField}
                type="password"
                value={values.password}
              />
            )}
          </FormField>
          <button className="btn btn-primary w-100" disabled={submitting} type="submit">
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
          <p className="mt-4 mb-0 text-center">
            ¿Aún no tienes cuenta? <Link to="/registro">Crear una cuenta</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
