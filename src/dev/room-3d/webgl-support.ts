/**
 * Can this browser draw the room at all?
 *
 * three 0.186 renders through WebGL2, and a browser that cannot give it a
 * context does not throw: the canvas mounts at the right size, every model
 * and texture loads, nothing is logged, and nothing is drawn. That silence
 * cost an evening of looking for a bug in the room, so it is asked about
 * plainly here and reported by both callers — the home page swaps in the
 * photograph (preview-hero.tsx), the dev page says so in words
 * (dev-room-home.tsx).
 *
 * The usual causes are hardware acceleration switched off in the browser's
 * settings, a GPU process that has crashed (a restart fixes it), or a driver
 * on the browser's blocklist. chrome://gpu names which.
 */
export type WebglVerdict = { ok: true; renderer: string | null } | { ok: false; reason: string }

let cached: WebglVerdict | null = null

export function webglSupport(): WebglVerdict {
  if (cached) return cached
  if (typeof document === 'undefined') {
    cached = { ok: false, reason: 'There is no document to draw into.' }
    return cached
  }
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) {
      cached = {
        ok: false,
        reason:
          'This browser would not give the page a WebGL2 context. Usually that is hardware acceleration switched off, a GPU process that has crashed, or a blocklisted driver — chrome://gpu says which.',
      }
      return cached
    }
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : null
    // Given straight back — the scene makes its own.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    cached = { ok: true, renderer }
  } catch (error) {
    cached = { ok: false, reason: `Asking for a WebGL2 context threw: ${String(error)}` }
  }
  return cached
}
