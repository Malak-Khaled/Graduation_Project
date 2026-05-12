export function isPlainObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

export function deepMerge(target, source) {
  if (!isPlainObject(target)) return source;
  const out = { ...target };
  if (!isPlainObject(source)) return out;
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    out[key] = isPlainObject(tv) && isPlainObject(sv) ? deepMerge(tv, sv) : sv;
  }
  return out;
}
