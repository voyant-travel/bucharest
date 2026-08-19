import { useState } from "react"

import { cn } from "~/lib/cn"

export interface NewsletterCopy {
  heading: string
  body?: string
  cta: string
  consent?: string
  /*
   * The status words. Operator-authored copy above, theme-owned copy here —
   * both arrive together because the component cannot tell them apart and must
   * not resolve either itself.
   */
  emailPlaceholder: string
  sending: string
  done: string
  failed: string
  notConnected: string
}

type State = "idle" | "sending" | "done" | "error"

/**
 * The one thing in the footer that asks for something.
 *
 * Consent is shown beside the field rather than after submission, because it
 * is the condition of giving the address, not a receipt for having given it.
 * It is also not pre-ticked and not bundled with anything else: a newsletter
 * opt-in folded into another action is not consent, whatever the checkbox says.
 *
 * There is no endpoint yet. The form reports that honestly instead of showing
 * a success state it has not earned — a "thank you" for an address that went
 * nowhere is the one outcome worse than an error.
 */
export default function NewsletterSignup({
  copy,
  endpoint,
}: {
  copy: NewsletterCopy
  endpoint?: string
}) {
  const [email, setEmail] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [state, setState] = useState<State>("idle")

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email || (copy.consent && !agreed)) return

    if (!endpoint) {
      setState("error")
      return
    }

    setState("sending")
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setState(response.ok ? "done" : "error")
    } catch {
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <p className="text-[0.9375rem] text-ink">
        {copy.done}
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="max-w-[26rem]">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Adresa de email
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          className="h-12 min-w-0 flex-1 rounded-card border border-line bg-surface px-4 text-[0.9375rem] text-ink outline-none transition-colors duration-300 placeholder:text-ink-subtle focus-visible:border-ink/40"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className={cn(
            "h-12 shrink-0 rounded-pill bg-accent px-6 text-[0.875rem] font-medium text-accent-ink",
            "transition-colors duration-300 hover:bg-accent-hover disabled:opacity-60",
          )}
        >
          {state === "sending" ? copy.sending : copy.cta}
        </button>
      </div>

      {copy.consent && (
        <label className="mt-3 flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-ink-subtle">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
          />
          <span>{copy.consent}</span>
        </label>
      )}

      {state === "error" && (
        <p className="mt-3 text-[0.8125rem] text-ink-muted" role="status">
          {endpoint
            ? copy.failed
            : copy.notConnected}
        </p>
      )}
    </form>
  )
}
