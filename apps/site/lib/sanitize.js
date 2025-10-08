export function sanitizeMDX(source) {
  if (!source) return source;
  return String(source)
    .replace(/<!--[\s\S]*?-->/g, "")     // strip HTML comments
    .replace(/<!DOCTYPE[^>]*>/gi, "");   // strip doctype declarations
}
