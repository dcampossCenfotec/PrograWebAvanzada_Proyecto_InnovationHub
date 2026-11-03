import { useRef, useState } from 'react'
import { MEMBER_TYPE_OPTIONS } from '../../auth/validation.js'
import { useAuth } from '../../auth/useAuth.js'
import FormField from '../../components/FormField.jsx'
import StatusPanel from '../../components/StatusPanel.jsx'
import { usersService } from '../../api/services/users.js'
import { SkillsEditor } from './SkillsEditor.jsx'
import {
  AVAILABILITY_OPTIONS,
  profileToValues,
  toProfilePayload,
  validateProfile,
} from './profile.js'

export function ProfileEditor({ profile, skills }) {
  const auth = useAuth()
  const submittingRef = useRef(false)
  const [values, setValues] = useState(() => profileToValues(profile))
  const [fields, setFields] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    const errorField = name === 'interestsText' ? 'interests' : name
    setValues((current) => ({ ...current, [name]: value }))
    setFields((current) => ({ ...current, [errorField]: undefined }))
    setSuccessMessage('')
  }

  function updateSkills(nextSkills) {
    setValues((current) => ({ ...current, skills: nextSkills }))
    setFields((current) => ({ ...current, skills: undefined }))
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submittingRef.current) return
    const validation = validateProfile(values)
    setFields(validation)
    setRequestError(null)
    setSuccessMessage('')
    if (Object.keys(validation).length) return

    submittingRef.current = true
    setSubmitting(true)
    try {
      const response = await usersService.updateMe(toProfilePayload(values))
      setValues(profileToValues(response.data))
      auth.updateUser(response.data)
      setSuccessMessage('Perfil guardado correctamente.')
    } catch (error) {
      setFields(error.fields || {})
      setRequestError(error)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <>
      {successMessage ? (
        <StatusPanel title="Cambios guardados" variant="success"><p>{successMessage}</p></StatusPanel>
      ) : null}
      {requestError ? (
        <StatusPanel title="No fue posible guardar el perfil" variant="error">
          <p>{requestError.message}</p>
          <p className="mb-0">Tus cambios permanecen en el formulario para que puedas corregirlos.</p>
        </StatusPanel>
      ) : null}

      <form className="card profile-form shadow-sm" noValidate onSubmit={handleSubmit}>
        <div className="card-body p-4 p-lg-5">
          <h2 className="h4 mb-4">Información personal</h2>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField error={fields.firstName} id="profile-first-name" label="Nombre">
                {(inputProps) => <input {...inputProps} autoComplete="given-name" className={`form-control${fields.firstName ? ' is-invalid' : ''}`} name="firstName" onChange={updateField} value={values.firstName} />}
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField error={fields.lastName} id="profile-last-name" label="Apellidos">
                {(inputProps) => <input {...inputProps} autoComplete="family-name" className={`form-control${fields.lastName ? ' is-invalid' : ''}`} name="lastName" onChange={updateField} value={values.lastName} />}
              </FormField>
            </div>
          </div>

          <FormField hint="El correo identifica tu cuenta y no se puede cambiar." id="profile-email" label="Correo electrónico">
            {(inputProps) => <input {...inputProps} className="form-control" readOnly type="email" value={profile.email} />}
          </FormField>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormField error={fields.memberType} id="profile-member-type" label="Tipo de miembro">
                {(inputProps) => (
                  <select {...inputProps} className={`form-select${fields.memberType ? ' is-invalid' : ''}`} name="memberType" onChange={updateField} value={values.memberType}>
                    {MEMBER_TYPE_OPTIONS.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
                  </select>
                )}
              </FormField>
            </div>
            <div className="col-12 col-md-6">
              <FormField error={fields.availability} id="profile-availability" label="Disponibilidad">
                {(inputProps) => (
                  <select {...inputProps} className={`form-select${fields.availability ? ' is-invalid' : ''}`} name="availability" onChange={updateField} value={values.availability}>
                    {AVAILABILITY_OPTIONS.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
                  </select>
                )}
              </FormField>
            </div>
          </div>

          <FormField error={fields.career} hint="Opcional. Carrera, departamento o área profesional." id="profile-career" label="Carrera o área">
            {(inputProps) => <input {...inputProps} className={`form-control${fields.career ? ' is-invalid' : ''}`} maxLength="120" name="career" onChange={updateField} value={values.career} />}
          </FormField>
          <FormField error={fields.bio} hint={`${values.bio.length}/600 caracteres.`} id="profile-bio" label="Biografía">
            {(inputProps) => <textarea {...inputProps} className={`form-control${fields.bio ? ' is-invalid' : ''}`} maxLength="600" name="bio" onChange={updateField} rows="5" value={values.bio} />}
          </FormField>
          <FormField error={fields.interests} hint="Separa hasta 15 intereses con comas." id="profile-interests" label="Intereses">
            {(inputProps) => <input {...inputProps} className={`form-control${fields.interests ? ' is-invalid' : ''}`} name="interestsText" onChange={updateField} value={values.interestsText} />}
          </FormField>
          <FormField error={fields.portfolioUrl} hint="Opcional. Debe comenzar con http:// o https://." id="profile-portfolio" label="Portafolio">
            {(inputProps) => <input {...inputProps} className={`form-control${fields.portfolioUrl ? ' is-invalid' : ''}`} maxLength="2048" name="portfolioUrl" onChange={updateField} placeholder="https://" type="url" value={values.portfolioUrl} />}
          </FormField>

          <hr className="my-4" />
          <SkillsEditor error={fields.skills} onChange={updateSkills} skills={skills} value={values.skills} />

          <div className="d-flex justify-content-end mt-4">
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? 'Guardando…' : 'Guardar perfil'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
