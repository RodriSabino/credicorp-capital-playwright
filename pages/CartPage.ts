import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
