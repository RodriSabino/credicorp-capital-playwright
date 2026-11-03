import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Carga las variables definidas en .env (BASE_URL, usuarios y password).
dotenv.config();

export default defineConfig({
  testDir: './tests',
  // Tiempo máximo por test y por aserción.
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  // En CI se impide dejar un test.only olvidado y se permite un reintento.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // "list" muestra el avance en consola; "html" genera el reporte con evidencias.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Configuración por ambiente: la URL se puede cambiar sin tocar el código.
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // SauceDemo expone el atributo data-test (no data-testid).
    testIdAttribute: 'data-test',
    // Evidencias: captura al final de cada test; trace y vídeo solo si falla.
    screenshot: 'on',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
