import { Locator, Page } from '@playwright/test';

/**
 * Elementos comunes a todas las pantallas internas (encabezado):
 * título de la sección y carrito con su contador.
 */
export abstract class BasePage {
  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(protected readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
