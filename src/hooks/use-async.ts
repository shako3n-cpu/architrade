import { useCallback, useEffect, useState } from 'react'

/**
 * ============================================================================
 * useAsync — the one place loading and error state is handled
 * ----------------------------------------------------------------------------
 * Give it a function that fetches something. Get back what every page needs:
 *
 *   const { data, status, error, retry } = useAsync(fetchProducts, [])
 *
 * Guarantees:
 *   - the request is aborted if the visitor navigates away mid-flight, so no
 *     state is written into a component that has already gone
 *   - a request that finishes after a newer one started is ignored, so a slow
 *     first response cannot overwrite a fast second one
 *   - an aborted request is never reported as an error
 *   - `retry()` runs it again, which is what the error state's button calls
 * ============================================================================
 */

export type AsyncStatus = 'loading' | 'success' | 'error'

export type AsyncResult<T> = {
  data: T | null
  status: AsyncStatus
  error: Error | null
  /** Run the request again. Safe to pass straight to onClick. */
  retry: () => void
}

export function useAsync<T>(
  /** Must accept the abort signal and pass it down to the network call. */
  task: (signal: AbortSignal) => Promise<T>,
  /** Re-runs whenever a value here changes — the language, a slug, a filter. */
  deps: unknown[],
): AsyncResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<Error | null>(null)
  // Bumping this re-runs the effect without changing any real dependency.
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setStatus('loading')
    setError(null)

    task(controller.signal)
      .then((result) => {
        if (!active) return
        setData(result)
        setStatus('success')
      })
      .catch((cause: unknown) => {
        // An abort is a deliberate cancellation, not a failure to report.
        if (!active || controller.signal.aborted) return
        setError(cause instanceof Error ? cause : new Error(String(cause)))
        setStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
    // `task` is intentionally not a dependency: an inline arrow function is a
    // new value on every render and would loop forever. The caller declares
    // what actually matters through `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { data, status, error, retry }
}
