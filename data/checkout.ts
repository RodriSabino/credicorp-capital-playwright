/** Datos ficticios para el formulario de envío. */
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const CUSTOMER: CustomerInfo = {
  firstName: 'Ana',
  lastName: 'Prueba',
  postalCode: '15001',
};

/**
 * Tasa de impuesto observada en la aplicación (8 % del subtotal, redondeado a 2 decimales).
 * Ejemplo verificado manualmente: subtotal $39.98 -> impuesto $3.20 -> total $43.18.
 */
export const TAX_RATE = 0.08;
