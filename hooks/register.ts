import type { Register } from 'claude-code'

// How long after an interrupted turn the engine may still put the prompt back.
const RESTORE_WINDOW_MS = 1500

export const register: Register = on => {
  // The last prompt typed at an idle session, until a turn answers it.
  let pending: string | undefined
  let abortedAt: number | undefined

  on('prompt.submit', ($, e, next) => {
    const isTyped =
      e.origin.kind === 'composer' && !e.command && !e.isMeta && !e.turnId
    if (isTyped && !e.attachments?.length) {
      pending = e.text
      abortedAt = undefined
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined && pending !== undefined) {
      if (e.isAborted) {
        const at = (abortedAt = Date.now())
        // Interrupted after output: nothing gets put back, so stop watching.
        $.clock.after(RESTORE_WINDOW_MS, () => {
          if (abortedAt === at) pending = abortedAt = undefined
        })
      } else {
        pending = undefined
      }
    }
    return next(e)
  })

  on('prompt.change', { origin: { kind: 'engine' } }, async ($, e, next) => {
    const sent = pending
    const result = await next(e)
    if (sent === undefined || !e.text.includes(sent)) return result
    if (abortedAt !== undefined && Date.now() - abortedAt > RESTORE_WINDOW_MS) return result

    pending = undefined
    abortedAt = undefined

    // Take the message back out of the box, keeping anything typed around it.
    const rest = e.text.replace(sent, '').trim()
    await $.prompt.fill({ text: rest, mode: 'replace' })

    // Keep it in the conversation, as an interrupt after output would.
    await $.session.append({
      message: {
        type: 'user',
        content: [{ type: 'text', text: `${sent}\n\n[Request interrupted by user]` }],
      },
    })
    $.ui.log(`> ${sent}\n  ⎿ Interrupted`)
    return result
  })
}
