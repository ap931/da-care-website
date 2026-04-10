import "server-only";

const COLOR_KEYS = {
  coral: "--coral",
  coralDark: "--coral-dark",
  coralLight: "--coral-light",
  mint: "--mint",
  mintDark: "--mint-dark",
  mintLight: "--mint-light",
  sky: "--sky",
  skyDark: "--sky-dark",
  skyLight: "--sky-light",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  textTertiary: "--text-tertiary",
  textDisabled: "--text-disabled",
  bgWhite: "--bg-white",
  bgSubtle: "--bg-subtle",
  surface: "--surface",
  borderDefault: "--border-default",
  borderLight: "--border-light",
};

const COLOR_VALUE =
  /^#([0-9a-fA-F]{3,8})$|^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$|^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$|^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$|^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

function isValidColor(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return COLOR_VALUE.test(trimmed);
}

export function buildThemeStyle(theme) {
  if (!theme || typeof theme !== "object") return "";
  const entries = [];
  for (const [key, cssVar] of Object.entries(COLOR_KEYS)) {
    const value = theme[key];
    if (isValidColor(value)) {
      entries.push(`${cssVar}: ${value.trim()};`);
    }
  }
  if (!entries.length) return "";
  return `:root{${entries.join("")}}`;
}
