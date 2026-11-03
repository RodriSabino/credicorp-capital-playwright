import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product } from '../data/products';

export class InventoryPage extends BasePage {
  /**
   * Tarjeta de un producto, ubicada por su nombre visible exacto.
   * Evita depender del id/data-test del botón, que en algunos productos
   * contiene caracteres especiales.
   */
  productCard(product: Product): Locator {
    return this.page
      .getByTestId('inventory-item')
      .filter({ has: this.page.getByText(product.name, { exact: true }) });
  }

  productPrice(product: Product): Locator {
    return this.productCard(product).getByTestId('inventory-item-price');
  }

  removeButton(product: Product): Locator {
    return this.productCard(product).getByRole('button', { name: 'Remove' });
  }

  async addToCart(product: Product): Promise<void> {
    await this.productCard(product).getByRole('button', { name: 'Add to cart' }).click();
  }
}
