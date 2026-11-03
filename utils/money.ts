/** Convierte centavos al formato que muestra la aplicación: 3998 -> "$39.98". */
export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Calcula subtotal, impuesto y total esperados (en centavos) a partir de los precios. */
export function expectedTotals(pricesInCents: number[], taxRate: number) {
  const subtotal = pricesInCents.reduce((sum, price) => sum + price, 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}
