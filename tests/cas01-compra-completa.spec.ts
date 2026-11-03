import { test, expect } from '../fixtures';
import { standardUser } from '../data/users';
import { BACKPACK, BIKE_LIGHT } from '../data/products';
import { CUSTOMER, TAX_RATE } from '../data/checkout';
import { expectedTotals, formatMoney } from '../utils/money';

/**
 * CAS01 - Compra completa de dos productos con usuario válido.
 * Diseño del escenario: documentacion/escenarios-de-prueba.md
 */
test.describe('CAS01 - Compra completa', () => {
  test(
    'un usuario estándar compra dos productos y recibe la confirmación del pedido',
    { tag: ['@CAS01', '@smoke'] },
    async ({
      page,
      step,
      loginPage,
      inventoryPage,
      cartPage,
      checkoutInformationPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      const products = [BACKPACK, BIKE_LIGHT];
      const productNames = products.map((p) => p.name);
      const totals = expectedTotals(
        products.map((p) => p.priceInCents),
        TAX_RATE,
      );

      await step('Iniciar sesión con el usuario estándar', async () => {
        await loginPage.goto();
        await loginPage.login(standardUser());
        await expect(page).toHaveURL(/\/inventory\.html$/);
        await expect(inventoryPage.title).toHaveText('Products');
      });

      await step('Agregar dos productos al carrito', async () => {
        for (const [index, product] of products.entries()) {
          await expect(inventoryPage.productPrice(product)).toHaveText(formatMoney(product.priceInCents));
          await inventoryPage.addToCart(product);
          await expect(inventoryPage.removeButton(product)).toBeVisible();
          await expect(inventoryPage.cartBadge).toHaveText(String(index + 1));
        }
      });

      await step('Revisar el carrito', async () => {
        await inventoryPage.openCart();
        await expect(page).toHaveURL(/\/cart\.html$/);
        await expect(cartPage.title).toHaveText('Your Cart');
        await expect(cartPage.itemNames).toHaveText(productNames);
      });

      await step('Completar los datos de envío', async () => {
        await cartPage.checkout();
        await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
        await expect(checkoutInformationPage.title).toHaveText('Checkout: Your Information');
        await checkoutInformationPage.fillCustomerInfo(CUSTOMER);
        await expect(checkoutInformationPage.postalCodeInput).toHaveValue(CUSTOMER.postalCode);
      });

      await step('Validar el resumen de la compra', async () => {
        await checkoutInformationPage.continueToOverview();
        await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
        await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');
        await expect(checkoutOverviewPage.itemNames).toHaveText(productNames);
        await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${formatMoney(totals.subtotal)}`);
        await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${formatMoney(totals.tax)}`);
        await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${formatMoney(totals.total)}`);
      });

      await step('Finalizar la compra y validar la confirmación', async () => {
        await checkoutOverviewPage.finish();
        await expect(page).toHaveURL(/\/checkout-complete\.html$/);
        await expect(checkoutCompletePage.title).toHaveText('Checkout: Complete!');
        await expect(checkoutCompletePage.confirmationHeader).toHaveText('Thank you for your order!');
        await expect(checkoutCompletePage.cartBadge).toBeHidden();
      });
    },
  );
});
