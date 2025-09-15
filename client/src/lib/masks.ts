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

export function toBrasilianReal(value?: number): string | undefined {
  return value != undefined
    ? value.toLocaleString("en-US", { // Changed locale from 'pt-BR' to 'en-US' for the dollar sign
        style: "currency",
        currency: "USD", // Changed currency from 'BRL' to 'USD'
      })
    : undefined;
}

export function formatBrasilianReal(value: string): string {
  const money = Number(value.replace(/[^0-9]/g, "")) / 100;

  if (isNaN(money)) {
    return "";
  }

  return money.toLocaleString("en-US", { // Changed locale from 'pt-BR' to 'en-US'
    style: "currency",
    currency: "USD", // Changed currency from 'BRL' to 'USD'
  });
}