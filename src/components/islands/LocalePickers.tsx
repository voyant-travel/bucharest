import { useEffect, useState } from "react"

import { cn } from "~/lib/cn"

export interface LocaleOption {
  code: string
  label: string
  href: string
  current?: boolean
}

/**
 * What a currency is called, and what it is written with.
 *
 * A code alone asks the reader to translate; the symbol is what they scan for
 * in a price. Unknown codes fall back to the code, which is correct rather
 * than clever — inventing a symbol for a currency the theme has never heard of
 * puts the wrong mark in front of real money.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  RON: "lei",
  USD: "$",
  GBP: "£",
  CHF: "Fr",
  HUF: "Ft",
  BGN: "лв",
  PLN: "zł",
  TRY: "₺",
}

export function currencyLabel(code: string): string {
  const symbol = CURRENCY_SYMBOLS[code.toUpperCase()]
  return symbol ? `${code} ${symbol}` : code
}

/**
 * The one control shape used for a choice in the site chrome.
 *
 * A native select, deliberately: it inherits the surrounding type size instead
 * of importing a component's own scale, it is one tab stop, and on a phone it
 * opens the platform picker rather than a list to scroll inside a 36px strip.
 * The visible text is drawn separately so the closed state can show the short
 * form while the options show the long one.
 */
export function ChromeSelect({
  label,
  value,
  items,
  onChange,
  className,
}: {
  label: string
  value: string
  items: { value: string; short: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}) {
  const shown = items.find((item) => item.value === value) ?? items[0]
  if (!shown) return null

  return (
    <span className={cn("relative inline-flex items-center gap-1", className)}>
      <span aria-hidden="true" className="pointer-events-none">
        {shown.short}
      </span>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none h-3 w-3 opacity-60"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </span>
  )
}

export function LanguagePicker({
  languages,
  label,
  className,
}: {
  languages: LocaleOption[]
  /* Handed in, never resolved here: this control is mounted inside islands
   * that already carry the reader's language, and a second resolver would be a
   * second place for the two to disagree. */
  label: string
  className?: string
}) {
  /* One language is not a choice, and a control offering it does nothing. */
  if (languages.length < 2) return null

  const current = languages.find((entry) => entry.current) ?? languages[0]

  return (
    <ChromeSelect
      label={label}
      className={className}
      value={current.href}
      onChange={(href) => {
        window.location.href = href
      }}
      items={languages.map((entry) => ({
        value: entry.href,
        short: entry.code,
        label: entry.label,
      }))}
    />
  )
}

/**
 * The currency the reader wants to see.
 *
 * It records a preference and nothing more. Converting prices needs rates the
 * theme does not have and must not invent — a fabricated rate is worse than no
 * switcher — so the choice is published for the catalogue to honour, and the
 * control only appears when an operator has said they price in these.
 */
export function CurrencyPicker({
  currencies,
  label,
  className,
}: {
  currencies: string[]
  label: string
  className?: string
}) {
  const [current, setCurrent] = useState(currencies[0] ?? "")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("currency")
      if (stored && currencies.includes(stored)) setCurrent(stored)
    } catch {
      /* Storage refused; the default is still correct. */
    }
  }, [currencies])

  if (currencies.length === 0) return null

  const choose = (next: string) => {
    setCurrent(next)
    try {
      window.localStorage.setItem("currency", next)
    } catch {
      /* The choice still applies for this page. */
    }
    document.documentElement.dataset.currency = next
  }

  return (
    <ChromeSelect
      label={label}
      className={className}
      value={current}
      onChange={choose}
      items={currencies.map((code) => ({
        value: code,
        short: currencyLabel(code),
        label: currencyLabel(code),
      }))}
    />
  )
}
