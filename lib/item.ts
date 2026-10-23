// Amounts in cents; PayPal's API takes dollars as strings.
export const ITEM = { name: "e2e T-shirt", amount: 2000 };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatUsd(cents: number): string {
  return usd.format(cents / 100);
}
