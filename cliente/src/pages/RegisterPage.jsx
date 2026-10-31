import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import {
  MEMBER_TYPE_OPTIONS,
  normalizeRegistration,
  validateRegistration,
} from '../auth/validation.js'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatusPanel from '../components/StatusPanel.jsx'

const initialValues = {
  firstName: '',
  lastName: '',
  memberType: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  termsAccepted: false,
}

function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const submittingRef = useRef(false)
  const [values, setValues] = useState(initialValues)
  const [fields, setFields] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (auth.status === 'authenticated') return <Navigate replace to="/perfil" />

  function updateField(event) {
    const { checked, name, type, value } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setFields((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submittingRef.current) return
    const validation = validateRegistration(values)
    setFields(validation)
    setRequestError(null)
    if (Object.keys(validation).length > 0) return

    submittingRef.current = true
    setSubmitting(true)
    try {
      await auth.register(normalizeRegistration(values))
      navigate('/perfil', { replace: true })
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
        description="Crea tu identidad en Innovation Hub. Podrás completar carrera, biografía y competencias desde tu perfil."
        eyebrow="Nueva cuenta"
        title="Crear cuenta"
      />

      {requestError ? (
        <StatusPanel title="No fue posible crear la cuenta" variant="error">
          <p>{requestError.message}</p>
        </StatusPanel>
      ) : null}

      <form className="card auth-card shadow-sm" noValidate onSubmit={handleSubmit}>
        <div className="card-body p-4 p-md-5">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField error={fields.firstName} id="register-first-name" label="Nombre">
                {(inputProps) => (
                  <input {...inputProps} autoComplete="given-name" autoFocus className={`form-control${fields.firstName ? ' is-invalid' : ''}`} name="firstName" onChange={updateField} value={values.firstName} />
                )}
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField error={fields.lastName} id="register-last-name" label="Apellidos">
                {(inputProps) => (
                  <input {...inputProps} autoComplete="family-name" className={`form-control${fields.lastName ? ' is-invalid' : ''}`} name="lastName" onChange={updateField} value={values.lastName} />
                )}
              </FormField>
            </div>
          </div>
          <FormField error={fields.memberType} id="register-member-type" label="Tipo de miembro">
            {(inputProps) => (
              <select {...inputProps} className={`form-select${fields.memberType ? ' is-invalid' : ''}`} name="memberType" onChange={updateField} value={values.memberType}>
                <option value="">Seleccionar…</option>
                {MEMBER_TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            )}
          </FormField>
          <FormField error={fields.email} id="register-email" label="Correo electrónico">
            {(inputProps) => (
              <input {...inputProps} autoComplete="email" className={`form-control${fields.email ? ' is-invalid' : ''}`} name="email" onChange={updateField} type="email" value={values.email} />
            )}
          </FormField>
          <FormField error={fields.password} hint="Entre 10 y 128 caracteres, con una letra y un número." id="register-password" label="Contraseña">
            {(inputProps) => (
              <input {...inputProps} autoComplete="new-password" className={`form-control${fields.password ? ' is-invalid' : ''}`} name="password" onChange={updateField} type="password" value={values.password} />
            )}
          </FormField>
          <FormField error={fields.passwordConfirmation} id="register-password-confirmation" label="Confirmar contraseña">
            {(inputProps) => (
              <input {...inputProps} autoComplete="new-password" className={`form-control${fields.passwordConfirmation ? ' is-invalid' : ''}`} name="passwordConfirmation" onChange={updateField} type="password" value={values.passwordConfirmation} />
            )}
          </FormField>
          <div className="mb-4">
            <div className="form-check">
              <input
                aria-describedby="register-terms-description"
                aria-invalid={Boolean(fields.termsAccepted)}
                checked={values.termsAccepted}
                className={`form-check-input${fields.termsAccepted ? ' is-invalid' : ''}`}
                id="register-terms"
                name="termsAccepted"
                onChange={updateField}
                type="checkbox"
              />
              <label className="form-check-label" htmlFor="register-terms">
                Acepto los términos de uso del proyecto académico.
              </label>
            </div>
            <div className="field-error text-danger" id="register-terms-description">{fields.termsAccepted || ''}</div>
          </div>
          <button className="btn btn-primary w-100" disabled={submitting} type="submit">
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
          <p className="mt-4 mb-0 text-center">
            ¿Ya tienes cuenta? <Link to="/ingresar">Ingresar</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default RegisterPage
