import { useCallback, useEffect, useRef, useState } from 'react'
import { isAbortError } from '../api/errors.js'

function defaultIsEmpty(value) {
  if (Array.isArray(value)) return value.length === 0
  if (Array.isArray(value?.data)) return value.data.length === 0
  return value === null || value === undefined
}

const initialState = {
  status: 'idle',
  data: null,
  error: null,
}

export function useApiQuery({
  queryKey,
  queryFn,
  enabled = true,
  isEmpty = defaultIsEmpty,
}) {
  const [state, setState] = useState(() => (
    enabled ? { ...initialState, status: 'loading' } : initialState
  ))
  const [retryVersion, setRetryVersion] = useState(0)
  const sequenceRef = useRef(0)

  const retry = useCallback(() => {
    setRetryVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      const sequence = sequenceRef.current + 1
      sequenceRef.current = sequence
      Promise.resolve().then(() => {
        if (sequenceRef.current === sequence) setState(initialState)
      })
      return undefined
    }

    const sequence = sequenceRef.current + 1
    sequenceRef.current = sequence
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (!controller.signal.aborted && sequenceRef.current === sequence) {
        setState((current) => ({ ...current, status: 'loading', error: null }))
      }
    })

    let queryPromise
    try {
      queryPromise = Promise.resolve(queryFn({ signal: controller.signal }))
    } catch (error) {
      queryPromise = Promise.reject(error)
    }

    queryPromise
      .then((data) => {
        if (controller.signal.aborted || sequenceRef.current !== sequence) return
        setState({
          status: isEmpty(data) ? 'empty' : 'success',
          data,
          error: null,
        })
      })
      .catch((error) => {
        if (
          controller.signal.aborted ||
          sequenceRef.current !== sequence ||
          isAbortError(error)
        ) {
          return
        }
        setState({ status: 'error', data: null, error })
      })

    return () => controller.abort(new DOMException('Consulta reemplazada.', 'AbortError'))
  }, [enabled, isEmpty, queryFn, queryKey, retryVersion])

  return { ...state, retry }
}
