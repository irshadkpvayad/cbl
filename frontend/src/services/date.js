export function formatDate(value) {
  if (!value) return "Today";
  const date = value.toDate?.() || (value._seconds ? new Date(value._seconds * 1000) : new Date(value));
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function compactNumber(value = 0) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}
