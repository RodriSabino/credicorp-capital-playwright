import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly confirmationHeader: Locator;
  readonly confirmationText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationHeader = page.getByTestId('complete-header');
    this.confirmationText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }
}
