// This file contains helper functions for formatting values.

export function formatCpf(value: string, removeChars: boolean = true): string {
  if (removeChars) {
    value = value.replace(/\D/g, ""); // remove non-numeric characters
  }

  return value
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

// --- THIS IS THE NEW, CORRECTED FUNCTION ---
// It takes a number and formats it into a US Dollar currency string.
// Example: 1234.5 -> "$1,234.50"
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return "";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}