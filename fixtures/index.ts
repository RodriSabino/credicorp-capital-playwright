import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInformationPage } from '../pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';

/** Ejecuta un paso del test y adjunta al reporte una captura del estado final del paso. */
type StepWithEvidence = (title: string, body: () => Promise<void>) => Promise<void>;

interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  step: StepWithEvidence;
}

export const test = base.extend<Fixtures>({
  // Cada test recibe los Page Objects ya creados sobre su propia página aislada.
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInformationPage: async ({ page }, use) => use(new CheckoutInformationPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),

  // Evidencia por paso: test.step agrupa las acciones en el reporte y,
  // al terminar cada paso, se adjunta una captura numerada (01, 02, ...).
  step: async ({ page }, use, testInfo) => {
    let stepNumber = 0;
    await use(async (title, body) => {
      await base.step(title, async () => {
        await body();
        stepNumber += 1;
        const name = `${String(stepNumber).padStart(2, '0')} - ${title}`;
        await testInfo.attach(name, {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      });
    });
  },
});

export { expect };
