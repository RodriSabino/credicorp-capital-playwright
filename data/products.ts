/**
 * Productos del catálogo usados en las pruebas.
 * Los precios se guardan en centavos para evitar errores de redondeo
 * al sumar decimales (29.99 + 9.99 en JavaScript no da exactamente 39.98).
 */
export interface Product {
  name: string;
  priceInCents: number;
}

export const BACKPACK: Product = { name: 'Sauce Labs Backpack', priceInCents: 2999 };
export const BIKE_LIGHT: Product = { name: 'Sauce Labs Bike Light', priceInCents: 999 };
