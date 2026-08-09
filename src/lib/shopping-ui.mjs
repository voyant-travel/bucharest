import {
  createShoppingClient,
  formatPresentationMoney,
  intentFromForm,
  messagesFor,
  ShoppingHttpError,
} from "./shopping.mjs"

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : undefined
}

function element(root, selector) {
  const found = root.querySelector(selector)
  return found instanceof HTMLElement ? found : undefined
}

function select(root, selector) {
  const found = root.querySelector(selector)
  return found instanceof HTMLSelectElement ? found : undefined
}

function translated(root, locale) {
  const messages = messagesFor(locale)
  root.lang = locale
  for (const node of root.querySelectorAll("[data-i18n]")) {
    const key = node.getAttribute("data-i18n")
    if (key && messages[key]) node.textContent = messages[key]
  }
  return messages
}

function replaceOptions(control, values, selected, locale, kind) {
  if (!control || !Array.isArray(values) || values.length === 0) return
  let names
  try {
    names = new Intl.DisplayNames([locale], { type: kind })
  } catch {
    names = undefined
  }
  control.replaceChildren(
    ...values.map((value) => {
      const option = document.createElement("option")
      option.value = value
      option.textContent = names?.of(kind === "language" ? value.split("-")[0] : value) ?? value
      option.selected = value === selected
      return option
    }),
  )
  control.disabled = values.length < 2
}

function resultRows(result) {
  if (result.kind === "indexed-inspiration") {
    return result.groups.map((group) => ({
      name: group.group,
      kind: "product",
      rows: Array.isArray(group.items) ? group.items : [],
    }))
  }
  return [{
    name: result.kind === "package" ? "packages" : `${result.kind}s`,
    kind: result.kind,
    rows: Array.isArray(result.offers) ? result.offers : [],
  }]
}

function titleFor(row, kind) {
  if (typeof row.title === "string") return row.title
  if (kind === "flight" && Array.isArray(row.itineraries)) {
    const first = record(row.itineraries[0])
    const segments = Array.isArray(first?.segments) ? first.segments : []
    return segments.flatMap((segment) => {
      const value = record(segment)
      const origin = record(value?.origin)?.code
      const destination = record(value?.destination)?.code
      return typeof origin === "string" && typeof destination === "string"
        ? [`${origin} → ${destination}`]
        : []
    }).join(" · ") || "Flight"
  }
  return kind === "stay" ? "Stay" : kind === "package" ? "Flight + stay" : "Experience"
}

function summaryFor(row, kind) {
  if (typeof row.summary === "string") return row.summary
  if (kind === "stay") {
    return [row.checkIn, row.checkOut, row.roomName, row.boardName]
      .filter((value) => typeof value === "string")
      .join(" · ")
  }
  if (kind === "package") {
    return [row.origin, row.destination, row.departureDate, row.nights ? `${row.nights} nights` : undefined]
      .filter((value) => typeof value === "string")
      .join(" · ")
  }
  return ""
}

function offerReference(row, kind) {
  const candidate = kind === "product" ? row.itemRef : row.offerRef
  return typeof candidate === "string" ? candidate : undefined
}

function card(row, kind, locale, messages, canAdd, onAdd) {
  const item = document.createElement("li")
  item.className = "result-card"
  const image = record(row.image)
  if (typeof image?.url === "string") {
    const picture = document.createElement("img")
    picture.src = image.url
    picture.alt = typeof image.alt === "string" ? image.alt : ""
    picture.loading = "lazy"
    item.append(picture)
  }
  const heading = document.createElement("h5")
  heading.textContent = titleFor(row, kind)
  item.append(heading)
  const summary = summaryFor(row, kind)
  if (summary) {
    const copy = document.createElement("p")
    copy.textContent = summary
    item.append(copy)
  }
  const formatted = formatPresentationMoney(row.price ?? row.priceFrom, locale)
  if (formatted) {
    const price = document.createElement("p")
    price.className = "price"
    price.textContent = `${messages.from} ${formatted} ${messages.perTrip}`
    item.append(price)
  }
  const reference = offerReference(row, kind)
  if (reference) {
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = messages.addToTrip
    button.disabled = !canAdd
    button.addEventListener("click", async () => {
      button.disabled = true
      const added = await onAdd(kind, reference)
      button.disabled = added || !canAdd
    })
    item.append(button)
  }
  return item
}

function renderResults(container, result, client, messages, onAdd) {
  const groups = element(container, "[data-result-groups]")
  if (!groups) return 0
  let count = 0
  groups.replaceChildren(
    ...resultRows(result).map((group) => {
      const section = document.createElement("section")
      section.className = "result-group"
      const heading = document.createElement("h4")
      heading.textContent = messages[group.name] ?? group.name.replaceAll("-", " ")
      section.append(heading)
      const list = document.createElement("ul")
      list.className = "result-grid"
      const rows = group.rows.map(record).filter(Boolean)
      count += rows.length
      list.append(
        ...rows.map((row) => card(
          row,
          group.kind,
          result.scope.locale,
          messages,
          Boolean(container.dataset.tripsEndpoint),
          onAdd,
        )),
      )
      section.append(list)
      return section
    }),
  )
  const results = element(container, "[data-shopping-results]")
  if (results) results.hidden = count === 0
  return count
}

function renderTrip(root, client, messages, onMutation) {
  const trip = client.trip()
  const list = root.querySelector("[data-trip-items]")
  const empty = element(root, "[data-trip-empty]")
  if (!(list instanceof HTMLOListElement) || !empty) return
  const items = Array.isArray(trip?.items) ? trip.items.map(record).filter(Boolean) : []
  empty.hidden = items.length > 0
  list.replaceChildren(
    ...items.map((item, index) => {
      const row = document.createElement("li")
      row.className = "trip-item"
      const title = document.createElement("p")
      title.textContent = typeof item.kind === "string" ? item.kind.replace("product", "experience") : "Trip item"
      row.append(title)
      const actions = document.createElement("div")
      actions.className = "trip-actions"
      const mutationButton = (label, disabled, mutation) => {
        const button = document.createElement("button")
        button.type = "button"
        button.textContent = label
        button.disabled = disabled
        button.addEventListener("click", async () => {
          button.disabled = true
          await onMutation(mutation)
        })
        return button
      }
      const refs = items.map((candidate) => candidate.itemRef).filter((value) => typeof value === "string")
      if (typeof item.itemRef === "string") {
        actions.append(
          mutationButton(messages.moveUp, index === 0, {
            kind: "reorder",
            itemRefs: index === 0 ? refs : refs.toSpliced(index - 1, 2, refs[index], refs[index - 1]),
          }),
          mutationButton(messages.moveDown, index === items.length - 1, {
            kind: "reorder",
            itemRefs: index === items.length - 1 ? refs : refs.toSpliced(index, 2, refs[index + 1], refs[index]),
          }),
          mutationButton(messages.remove, false, { kind: "remove", itemRef: item.itemRef }),
        )
      }
      row.append(actions)
      return row
    }),
  )
}

export function mountShopping(root) {
  const form = root.querySelector("[data-shopping-form]")
  const kind = select(root, "[data-shopping-kind]")
  const localeControl = select(root, "[data-shopping-locale]")
  const currencyControl = select(root, "[data-shopping-currency]")
  const status = element(root, "[data-shopping-status]")
  const tripStatus = element(root, "[data-trip-status]")
  if (!(form instanceof HTMLFormElement) || !kind || !localeControl || !currencyControl || !status || !tripStatus) return

  let messages = translated(root, root.dataset.locale ?? "en")
  let lastIntent
  let busy = false
  const client = createShoppingClient({
    searchEndpoint: root.dataset.searchEndpoint,
    tripsEndpoint: root.dataset.tripsEndpoint,
    locale: root.dataset.locale ?? "en",
    origin: window.location.origin,
  })

  function switchIntent() {
    for (const fieldset of form.querySelectorAll("[data-intent]")) {
      if (!(fieldset instanceof HTMLFieldSetElement)) continue
      const active = fieldset.dataset.intent === kind.value
      fieldset.hidden = !active
      fieldset.disabled = !active
    }
  }

  function applyScope(scope) {
    const available = record(scope.available)
    replaceOptions(localeControl, available?.locales, scope.locale, scope.locale, "language")
    replaceOptions(currencyControl, available?.currencies, scope.currency, scope.locale, "currency")
    messages = translated(root, scope.locale)
    const scopeStatus = element(root, "[data-scope-status]")
    if (scopeStatus) scopeStatus.textContent = `${scope.locale}, ${scope.currency}`
  }

  async function runSearch(intent = intentFromForm(form)) {
    if (busy || !root.dataset.searchEndpoint) return
    busy = true
    lastIntent = intent
    status.textContent = messages.searching
    const submit = form.querySelector("[data-shopping-submit]")
    if (submit instanceof HTMLButtonElement) submit.disabled = true
    try {
      const result = await client.search(intent)
      applyScope(result.scope)
      const count = renderResults(root, result, client, messages, addToTrip)
      const coverage = record(result.coverage)
      status.textContent = count === 0 ? messages.noResults : coverage?.status === "partial" ? messages.partial : ""
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : messages.retry
    } finally {
      busy = false
      if (submit instanceof HTMLButtonElement) submit.disabled = false
    }
  }

  async function addToTrip(offerKind, offerRef) {
    tripStatus.textContent = messages.searching
    try {
      await client.add(offerKind, offerRef)
      renderTrip(root, client, messages, mutateTrip)
      tripStatus.textContent = messages.added
      return true
    } catch (error) {
      renderTrip(root, client, messages, mutateTrip)
      tripStatus.textContent = error instanceof ShoppingHttpError && error.status === 409
        ? messages.conflict
        : error instanceof Error ? error.message : messages.retry
      return false
    }
  }

  async function mutateTrip(mutation) {
    tripStatus.textContent = messages.searching
    try {
      await client.mutate(mutation)
      renderTrip(root, client, messages, mutateTrip)
      tripStatus.textContent = messages.updated
    } catch (error) {
      renderTrip(root, client, messages, mutateTrip)
      tripStatus.textContent = error instanceof ShoppingHttpError && error.status === 409
        ? messages.conflict
        : error instanceof Error ? error.message : messages.retry
    }
  }

  kind.addEventListener("change", switchIntent)
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    void runSearch()
  })
  localeControl.addEventListener("change", () => {
    client.chooseScope({ locale: localeControl.value, currency: currencyControl.value })
    messages = translated(root, localeControl.value)
    renderTrip(root, client, messages, mutateTrip)
    if (lastIntent) void runSearch(lastIntent)
  })
  currencyControl.addEventListener("change", () => {
    client.chooseScope({ locale: localeControl.value, currency: currencyControl.value })
    if (lastIntent) void runSearch(lastIntent)
  })
  switchIntent()
  renderTrip(root, client, messages, mutateTrip)
  if (root.dataset.searchEndpoint) void runSearch()
}
