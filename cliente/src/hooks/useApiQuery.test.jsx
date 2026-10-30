import { StrictMode, useCallback } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useApiQuery } from './useApiQuery.js'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('useApiQuery', () => {
  it('expone carga, éxito y vacío como estados distintos', async () => {
    const successQueryFn = async () => ({ data: [{ id: 1 }] })
    const success = renderHook(() => useApiQuery({
      queryKey: 'success',
      queryFn: successQueryFn,
    }))

    expect(success.result.current.status).toBe('loading')
    await waitFor(() => expect(success.result.current.status).toBe('success'))

    const emptyQueryFn = async () => ({ data: [] })
    const empty = renderHook(() => useApiQuery({
      queryKey: 'empty',
      queryFn: emptyQueryFn,
    }))
    await waitFor(() => expect(empty.result.current.status).toBe('empty'))
  })

  it('expone el error y permite reintentar', async () => {
    const queryFn = vi.fn()
      .mockRejectedValueOnce(new Error('falló'))
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
    const { result } = renderHook(() => useApiQuery({ queryKey: 'retry', queryFn }))

    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(queryFn).toHaveBeenCalledTimes(2)
  })

  it('impide que una respuesta anterior lenta reemplace la consulta vigente', async () => {
    const first = deferred()
    const second = deferred()
    const calls = { A: first, B: second }

    function useChangingQuery(value) {
      const queryFn = useCallback(() => calls[value].promise, [value])
      return useApiQuery({ queryKey: value, queryFn })
    }

    const { result, rerender } = renderHook(
      ({ value }) => useChangingQuery(value),
      { initialProps: { value: 'A' } },
    )
    rerender({ value: 'B' })

    await act(async () => second.resolve({ data: [{ id: 'B' }] }))
    await waitFor(() => expect(result.current.data?.data[0].id).toBe('B'))

    await act(async () => first.resolve({ data: [{ id: 'A' }] }))
    expect(result.current.data.data[0].id).toBe('B')
  })

  it('cancela la solicitud al desmontar', () => {
    let capturedSignal
    const queryFn = vi.fn(({ signal }) => {
      capturedSignal = signal
      return new Promise(() => {})
    })
    const { unmount } = renderHook(() => useApiQuery({ queryKey: 'unmount', queryFn }))

    unmount()

    expect(capturedSignal.aborted).toBe(true)
    expect(capturedSignal.reason.name).toBe('AbortError')
  })

  it('termina correctamente bajo StrictMode', async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }] })
    const wrapper = ({ children }) => <StrictMode>{children}</StrictMode>
    const { result } = renderHook(
      () => useApiQuery({ queryKey: 'strict', queryFn }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(queryFn.mock.calls.length).toBeGreaterThanOrEqual(1)
  })
})
