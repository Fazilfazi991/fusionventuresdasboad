const placeholderPattern = /\{\{[^}]+\}\}/;

export function findUnresolvedPlaceholders(input: string) {
  const matches = input.match(new RegExp(placeholderPattern.source, "g")) || [];
  return Array.from(new Set(matches));
}

export function hasUnresolvedPlaceholders(input: string) {
  return placeholderPattern.test(input);
}

export function replaceUnresolvedPlaceholders(input: string, values: Record<string, string>) {
  return input.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, key: string) => {
    const normalized = key.trim();
    return values[normalized] || "";
  });
}
