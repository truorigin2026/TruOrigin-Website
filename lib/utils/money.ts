export function formatMoney(cents: number, currency: string = "inr") {
  const amount = cents / 100;
  if (currency.toLowerCase() === "inr") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  }
  return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
}
