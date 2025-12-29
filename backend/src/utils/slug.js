export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function titleFromLeetCodeUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("problems");
    if (idx >= 0 && parts[idx + 1]) {
      const slug = parts[idx + 1];
      return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  } catch {}
  return "LeetCode Problem";
}

export function leetcodeSlugFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("problems");
    if (idx >= 0 && parts[idx + 1]) return String(parts[idx + 1]).trim();
  } catch {}
  return "";
}
