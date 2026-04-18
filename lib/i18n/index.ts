import raw from "./translations.json";

export type Language = "en" | "de";

type Translations = typeof raw.en;
type DeepValue<T> = T extends string ? T : T extends object ? DeepValue<T[keyof T]> : never;

const data: Record<Language, Translations> = raw as Record<Language, Translations>;

export function translate(lang: Language, key: string, vars?: Record<string, string | number>): string {
  const parts = key.split(".");
  let node: any = data[lang];
  for (const part of parts) {
    if (node == null || typeof node !== "object") return key;
    node = node[part];
  }
  if (typeof node !== "string") return key;
  if (!vars) return node;
  return node.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
