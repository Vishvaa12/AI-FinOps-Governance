export function formatCurrency(value: number | undefined | null, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value ?? 0);
}

export function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatPercent(value: number | undefined | null) {
  return `${Math.round(value ?? 0)}%`;
}

export function formatDateTime(value: string | undefined | null) {
  if (!value) {
    return "Not available";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function titleCase(value: string | undefined | null) {
  if (!value) {
    return "None";
  }
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
