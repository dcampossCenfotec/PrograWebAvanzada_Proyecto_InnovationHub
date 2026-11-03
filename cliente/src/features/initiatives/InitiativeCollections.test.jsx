import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { InitiativeSkillsEditor } from './InitiativeSkillsEditor.jsx'
import { InitiativeTagsEditor } from './InitiativeTagsEditor.jsx'

const skills = Array.from({ length: 11 }, (_, index) => ({ id: `skill-${index}`, name: `Competencia ${index}` }))
const showModal = HTMLDialogElement.prototype.showModal
const close = HTMLDialogElement.prototype.close
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
})
afterAll(() => { HTMLDialogElement.prototype.showModal = showModal; HTMLDialogElement.prototype.close = close })
function SkillsHarness({ initial = [], onChange = () => {}, available = skills, disabled = false }) {
  const [value, setValue] = useState(initial)
  return <InitiativeSkillsEditor disabled={disabled} initialSkills={skills} onChange={(next) => { setValue(next); onChange(next) }} skills={available} value={value} />
}
function TagsHarness({ initial = [], onChange = () => {}, onSubmit = () => {}, disabled = false }) {
  const [value, setValue] = useState(initial.map((tag, index) => ({ key: `tag-${index}`, value: tag })))
  const [draft, setDraft] = useState('')
  return <form aria-label="Formulario de prueba" onSubmit={(event) => { event.preventDefault(); onSubmit() }}><InitiativeTagsEditor disabled={disabled} draft={draft} onChange={(next) => { setValue(next); onChange(next) }} onDraftChange={setDraft} value={value} /></form>
}
function addSkill(id) {
  fireEvent.change(screen.getByLabelText('Competencia por agregar'), { target: { value: id } })
  fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
}
function addTag(value, { enter = false } = {}) {
  fireEvent.change(screen.getByLabelText('Etiqueta por agregar'), { target: { value } })
  if (enter) fireEvent.keyDown(screen.getByLabelText('Etiqueta por agregar'), { key: 'Enter' })
  else fireEvent.click(screen.getByRole('button', { name: 'Agregar etiqueta' }))
}

describe('competencias desde catálogo', () => {
  it('agrega IDs sin texto libre y rechaza repetida antes de cambiar el arreglo', () => {
    const changed = vi.fn()
    render(<SkillsHarness onChange={changed} />)
    addSkill('skill-0'); addSkill('skill-1'); addSkill('skill-0')
    expect(changed).toHaveBeenCalledTimes(2)
    expect(changed).toHaveBeenLastCalledWith(['skill-0', 'skill-1'])
    expect(screen.getByText('Esta competencia ya está agregada.')).toBeDefined()
    expect(within(screen.getByRole('list', { name: 'Competencias agregadas' })).getAllByRole('listitem')).toHaveLength(2)
  })
  it('selección vacía o desconocida no agrega una asociación', () => {
    const changed = vi.fn()
    render(<SkillsHarness onChange={changed} />)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar competencia' }))
    expect(screen.getByText('Selecciona una competencia disponible del catálogo.')).toBeDefined()
    expect(changed).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText('Competencia por agregar'))
  })
  it('límite de diez impide una undécima sin reemplazar las seleccionadas', () => {
    const changed = vi.fn()
    render(<SkillsHarness initial={skills.slice(0, 10).map(({ id }) => id)} onChange={changed} />)
    addSkill('skill-10')
    expect(screen.getByText('Puedes agregar como máximo 10 competencias.')).toBeDefined()
    expect(changed).not.toHaveBeenCalled()
  })
  it('Cancelar o Escape conserva la competencia y devuelve el foco al disparador', () => {
    const changed = vi.fn()
    render(<SkillsHarness initial={['skill-0', 'skill-1']} onChange={changed} />)
    const trigger = screen.getByRole('button', { name: 'Quitar competencia Competencia 0' })
    trigger.focus(); fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Quitar competencia' })
    expect(within(dialog).getByText('Competencia 0')).toBeDefined()
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancelar' }))
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(changed).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger)
  })
  it('confirmar quita únicamente el ID elegido y enfoca el control siguiente', () => {
    const changed = vi.fn()
    render(<SkillsHarness initial={['skill-0', 'skill-1', 'skill-2']} onChange={changed} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar competencia Competencia 1' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Quitar competencia' }))
    expect(changed).toHaveBeenLastCalledWith(['skill-0', 'skill-2'])
    expect(screen.queryByRole('button', { name: 'Quitar competencia Competencia 1' })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Quitar competencia Competencia 2' }))
  })
  it('quitar la última devuelve foco al selector y conserva el caso vacío', () => {
    render(<SkillsHarness initial={['skill-0']} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar competencia Competencia 0' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Quitar competencia' }))
    expect(screen.getByText('No has agregado competencias.')).toBeDefined()
    expect(document.activeElement).toBe(screen.getByLabelText('Competencia por agregar'))
  })
  it('una competencia anterior no disponible conserva nombre/ID y puede quitarse', () => {
    render(<SkillsHarness available={[]} initial={['skill-0']} />)
    expect(screen.getByText('Competencia 0 (no disponible)')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Quitar competencia Competencia 0' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Quitar competencia' }))
    expect(screen.getByText('No has agregado competencias.')).toBeDefined()
  })
  it('controles deshabilitados no agregan ni quitan asociaciones', () => {
    const changed = vi.fn()
    render(<SkillsHarness disabled initial={['skill-0']} onChange={changed} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar competencia Competencia 0' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Agregar competencia' }).disabled).toBe(true)
    expect(changed).not.toHaveBeenCalled()
  })
})

describe('etiquetas como chips', () => {
  it('Enter agrega una etiqueta recortada sin enviar el formulario', () => {
    const changed = vi.fn(); const submit = vi.fn()
    render(<TagsHarness onChange={changed} onSubmit={submit} />)
    addTag('  Educación  ', { enter: true })
    expect(changed.mock.calls[0][0].map(({ value }) => value)).toEqual(['Educación'])
    expect(screen.getByLabelText('Etiqueta por agregar').value).toBe('')
    expect(submit).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText('Etiqueta por agregar'))
  })
  it('las comas se conservan dentro de un único chip', () => {
    const changed = vi.fn()
    render(<TagsHarness onChange={changed} />)
    addTag('Diseño, investigación')
    expect(changed.mock.calls[0][0]).toHaveLength(1)
    expect(screen.getByText('Diseño, investigación')).toBeDefined()
  })
  it('duplica con mayúsculas/tildes/espacios no altera la lista ni pierde lo escrito', () => {
    const changed = vi.fn()
    render(<TagsHarness initial={['Educación']} onChange={changed} />)
    addTag(' EDUCACION ')
    expect(screen.getByText(/Esta etiqueta ya está agregada/)).toBeDefined()
    expect(changed).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Etiqueta por agregar').value).toBe(' EDUCACION ')
  })
  it.each(['', '   ', 'a'.repeat(41)])('rechaza etiqueta vacía o demasiado larga', (tag) => {
    const changed = vi.fn()
    render(<TagsHarness onChange={changed} />)
    addTag(tag)
    expect(changed).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeDefined()
  })
  it('acepta exactamente cuarenta caracteres y bloquea la undécima', () => {
    const changed = vi.fn()
    render(<TagsHarness initial={Array.from({ length: 9 }, (_, i) => `etiqueta-${i}`)} onChange={changed} />)
    addTag('a'.repeat(40))
    expect(changed.mock.calls[0][0]).toHaveLength(10)
    addTag('undécima')
    expect(screen.getByText('Puedes agregar como máximo 10 etiquetas.')).toBeDefined()
    expect(changed).toHaveBeenCalledTimes(1)
  })
  it('quitar el chip del medio conserva las demás claves/textos y mueve el foco', () => {
    const changed = vi.fn()
    render(<TagsHarness initial={['primera', 'segunda', 'tercera']} onChange={changed} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar etiqueta segunda' }))
    expect(changed).toHaveBeenLastCalledWith([{ key: 'tag-0', value: 'primera' }, { key: 'tag-2', value: 'tercera' }])
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Quitar etiqueta tercera' }))
  })
  it('quitar el último chip devuelve el foco al campo de entrada', () => {
    render(<TagsHarness initial={['única']} />)
    fireEvent.click(screen.getByRole('button', { name: 'Quitar etiqueta única' }))
    expect(screen.getByText('No has agregado etiquetas.')).toBeDefined()
    expect(document.activeElement).toBe(screen.getByLabelText('Etiqueta por agregar'))
  })
  it('Enter durante composición no agrega ni envía el formulario', () => {
    const changed = vi.fn(); const submit = vi.fn()
    render(<TagsHarness onChange={changed} onSubmit={submit} />)
    const input = screen.getByLabelText('Etiqueta por agregar')
    fireEvent.change(input, { target: { value: 'composición' } })
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 })
    expect(changed).not.toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })
  it('los chips existentes tienen nombres accesibles y los controles respetan guardado', () => {
    const changed = vi.fn()
    render(<TagsHarness disabled initial={['etiqueta']} onChange={changed} />)
    const remove = screen.getByRole('button', { name: 'Quitar etiqueta etiqueta' })
    expect(remove.disabled).toBe(true)
    fireEvent.click(remove)
    expect(changed).not.toHaveBeenCalled()
  })
})
