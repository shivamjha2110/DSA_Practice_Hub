export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
