import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Textarea } from "~/components/ui/textarea"
import type { SettingDecl, ShellView } from "~/lib/gallery"

interface Props {
  view: Extract<ShellView, { kind: "section" }>
  draft: Record<string, string>
  onChange: (id: string, value: string) => void
  onReset: () => void
  /** The instance as it stands with the current, unsaved control values. */
  live: unknown
}

const LONG_TEXT = ["richtext", "inline_richtext", "textarea"]

function describeDefault(value: unknown): string {
  if (value === undefined) return "—"
  return typeof value === "string" ? value : JSON.stringify(value)
}

/**
 * The controls panel.
 *
 * Every field is rendered from the setting's declared `type`, `options`,
 * `min`/`max` and `default` — the same declaration the editor builds an
 * operator's panel from — so a setting added to `theme.config.ts` gains a
 * control here for free, and one removed loses it. There are no hand-written
 * control definitions anywhere in the gallery.
 */
export function GalleryPanel({ view, draft, onChange, onReset, live }: Props) {
  const settings = view.settings ?? []
  const blocks = view.blocks ?? []
  const resolvedSettings = view.resolved.data.settings as Record<string, unknown>

  /** Your edit if you made one, otherwise whatever the variant renders. */
  const valueOf = (setting: SettingDecl): string => {
    if (draft[setting.id] !== undefined) return draft[setting.id]
    const value = resolvedSettings[setting.id]
    return value === undefined || value === null ? "" : String(value)
  }

  /* Foundations have nothing to configure, so they open on their prose. */
  const initial = settings.length > 0 ? "controls" : "docs"

  return (
    <Tabs defaultValue={initial} className="h-full gap-0">
      <TabsList variant="line" className="w-full justify-start border-b px-2">
        <TabsTrigger value="docs">Docs</TabsTrigger>
        {settings.length > 0 && <TabsTrigger value="controls">Controls</TabsTrigger>}
        {settings.length > 0 && <TabsTrigger value="settings">Settings</TabsTrigger>}
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>

      <TabsContent value="docs" className="overflow-y-auto p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {view.group === "foundation"
            ? "Foundation"
            : view.group === "chrome"
              ? "Site chrome"
              : "Section"}
        </p>
        <h2 className="mt-1 text-sm font-semibold">{view.name}</h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          {view.description}
        </p>

        <p className="mt-5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Variants — {view.variants.length}
        </p>
        <ul className="mt-1.5 space-y-2.5">
          {view.variants.map((entry) => (
            <li key={entry.id}>
              <span
                className={
                  entry.id === view.variantId
                    ? "text-[12.5px] font-medium text-primary"
                    : "text-[12.5px] font-medium"
                }
              >
                {entry.label}
              </span>
              <span className="block text-[11.5px] leading-relaxed text-muted-foreground">
                {entry.note}
              </span>
            </li>
          ))}
        </ul>

        {view.group === "section" && (
          <>
            <p className="mt-5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Shape
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              {settings.length} settings
              {blocks.length > 0
                ? `, ${blocks.length} block ${blocks.length === 1 ? "type" : "types"}${
                    view.maxBlocks ? ` (max ${view.maxBlocks})` : ""
                  }`
                : ", no blocks"}
              . Declared in <code className="font-mono">theme.config.ts</code>; this
              panel is generated from that declaration.
            </p>
          </>
        )}
      </TabsContent>

      <TabsContent value="controls" className="overflow-y-auto p-3">
        {settings.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            This section declares no settings.
          </p>
        ) : (
          <div className="space-y-3.5">
            {settings.map((setting) => {
              const id = `control-${setting.id}`
              const value = valueOf(setting)
              return (
                <div key={setting.id} className="space-y-1.5">
                  <Label
                    htmlFor={id}
                    className="flex items-baseline gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground"
                  >
                    {setting.label ?? setting.id}
                    <span className="font-mono text-[10px] normal-case tracking-normal opacity-60">
                      {setting.type}
                    </span>
                  </Label>

                  {setting.options ? (
                    <Select
                      value={value}
                      onValueChange={(next) => onChange(setting.id, String(next ?? ""))}
                      items={[
                        { label: "—", value: "" },
                        ...setting.options.map((option) => ({
                          label: option.label,
                          value: option.value,
                        })),
                      ]}
                    >
                      <SelectTrigger id={id} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">—</SelectItem>
                        {setting.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : setting.type === "checkbox" ? (
                    <div className="flex h-8 items-center">
                      <Switch
                        id={id}
                        checked={value === "true"}
                        onCheckedChange={(checked) =>
                          onChange(setting.id, checked ? "true" : "false")
                        }
                      />
                    </div>
                  ) : setting.type === "range" ? (
                    <Input
                      id={id}
                      type="number"
                      min={setting.min}
                      max={setting.max}
                      step={setting.step}
                      value={value}
                      onChange={(event) => onChange(setting.id, event.target.value)}
                    />
                  ) : setting.type === "color" ? (
                    <Input
                      id={id}
                      type="color"
                      value={value || "#000000"}
                      onChange={(event) => onChange(setting.id, event.target.value)}
                    />
                  ) : LONG_TEXT.includes(setting.type) ? (
                    <Textarea
                      id={id}
                      rows={3}
                      value={value}
                      onChange={(event) => onChange(setting.id, event.target.value)}
                    />
                  ) : (
                    <Input
                      id={id}
                      type="text"
                      placeholder={setting.placeholder}
                      value={value}
                      onChange={(event) => onChange(setting.id, event.target.value)}
                    />
                  )}

                  {setting.info && (
                    <p className="text-[11px] text-muted-foreground">{setting.info}</p>
                  )}
                </div>
              )
            })}

            <div className="flex items-center gap-2 border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={onReset}>
                Reset
              </Button>
              <span className="text-[11px] text-muted-foreground">
                Edits apply live and stay in the URL.
              </span>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="settings" className="overflow-y-auto p-3">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="border-b py-1.5 pr-2 font-medium">id</th>
              <th className="border-b py-1.5 pr-2 font-medium">type</th>
              <th className="border-b py-1.5 pr-2 font-medium">default</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting.id} className="align-top">
                <td className="border-b py-1.5 pr-2">
                  <code className="font-mono text-[11px]">{setting.id}</code>
                  {setting.required && <span className="text-primary"> *</span>}
                </td>
                <td className="border-b py-1.5 pr-2">
                  <code className="font-mono text-[11px]">{setting.type}</code>
                </td>
                <td className="border-b py-1.5 pr-2">
                  <code className="font-mono text-[11px]">
                    {describeDefault(setting.default)}
                  </code>
                  {setting.min !== undefined && (
                    <div className="text-[10px] text-muted-foreground">
                      {setting.min}–{setting.max}
                      {setting.unit ?? ""}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blocks.length > 0 && (
          <>
            <p className="mt-4 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Blocks — {view.maxBlocks ?? "no"} maximum
            </p>
            <table className="w-full text-[12px]">
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.type} className="align-top">
                    <td className="border-b py-1.5 pr-2">
                      <code className="font-mono text-[11px]">{block.type}</code>
                      <div className="text-[10px] text-muted-foreground">
                        {block.name}
                      </div>
                    </td>
                    <td className="border-b py-1.5">
                      {(block.settings ?? []).map((setting) => (
                        <div key={setting.id}>
                          <code className="font-mono text-[11px]">{setting.id}</code>{" "}
                          <span className="text-[10px] text-muted-foreground">
                            {setting.type}
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </TabsContent>

      <TabsContent value="json" className="overflow-auto p-3">
        <pre className="font-mono text-[11px] leading-relaxed">
          {JSON.stringify(live, null, 2)}
        </pre>
      </TabsContent>
    </Tabs>
  )
}
