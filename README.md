# Reto técnico QA Automation — SauceDemo con Playwright

Análisis, diseño de pruebas y automatización sobre la aplicación pública [SauceDemo](https://www.saucedemo.com/), usando Playwright con TypeScript.

## Descripción y alcance

Proyecto desarrollado como reto técnico de QA Automation. Su objetivo es analizar la aplicación de comercio electrónico de demostración [SauceDemo](https://www.saucedemo.com/) (Swag Labs), diseñar escenarios de prueba relevantes y automatizar uno de ellos con Playwright y TypeScript, siguiendo un diseño mantenible y fácil de explicar.

**Incluye**

- Exploración de la aplicación: inicio de sesión, catálogo de productos, carrito y checkout (datos de envío, resumen y confirmación).
- Diseño de tres escenarios (positivo, negativo y regla de negocio), cada uno documentado con identificación, propósito, preparación, ejecución, validación, clasificación y decisión de automatización → [`documentacion/escenarios-de-prueba.md`](documentacion/escenarios-de-prueba.md)
- Automatización del escenario CAS01 con Page Object Model, fixtures y evidencia (captura) por cada paso.
- Evidencias de los defectos encontrados durante la exploración → [`documentacion/evidencias/`](documentacion/evidencias/)

| Escenario | Tipo | Estado |
|---|---|---|
| CAS01 · Compra completa de dos productos | Positivo | **Automatizado** (`tests/cas01-compra-completa.spec.ts`) |
| CAS02 · Login con usuario bloqueado | Negativo | Documentado |
| CAS03 · Compra con carrito vacío | Regla de negocio | Documentado |

**¿Por qué CAS01?** Es el camino crítico del negocio (si falla, no hay ventas), es determinista y repetible como prueba de regresión, y recorre las seis pantallas del flujo, lo que permite demostrar un diseño mantenible (Page Object Model), aserciones relevantes y sincronización entre pantallas.

## Herramientas y prerrequisitos

- Node.js 20 o superior (incluye npm)
- Playwright Test + TypeScript + dotenv (versiones exactas fijadas en `package-lock.json`)
- Navegador Chromium (lo instala Playwright)
- Acceso a internet hacia `https://www.saucedemo.com/`

## Instalación

```bash
git clone https://github.com/RodriSabino/credicorp-capital-playwright.git
cd credicorp-capital-playwright
npm install
npx playwright install chromium
cp .env.example .env
```

Edita `.env` y completa `SAUCE_PASSWORD` con el password compartido que SauceDemo muestra en su pantalla de login. El archivo `.env` está en `.gitignore`: ninguna credencial se versiona. Si falta la variable, el test se detiene con un mensaje que indica cómo configurarla.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `BASE_URL` | URL del ambiente | `https://www.saucedemo.com` |
| `STANDARD_USER` | Usuario estándar | `standard_user` |
| `LOCKED_OUT_USER` | Usuario bloqueado | `locked_out_user` |
| `SAUCE_PASSWORD` | Password compartido (obligatorio) | — |

## Ejecución

```bash
npm run typecheck              # verificación de tipos de TypeScript
npm test                       # todos los tests, sin interfaz (headless)
npm run test:headed            # con el navegador visible
npx playwright test --grep @CAS01   # solo el escenario CAS01
```

## Reporte y evidencias

```bash
npm run report
```

Abre el reporte HTML (`playwright-report/`). Para cada test se muestra:

- **Pasos de negocio** (`test.step`): iniciar sesión, agregar productos, revisar carrito, datos de envío, resumen y confirmación.
- **Una captura por paso**, numerada (`01 - …` a `06 - …`), adjunta como evidencia del estado de la pantalla al terminar cada paso.
- **Si un test falla:** captura del momento del fallo, vídeo y *trace* (línea de tiempo con DOM, red y consola) en `test-results/`.

## Arquitectura

```
data/                   Datos de prueba: usuarios (desde .env), productos, cliente y tasa de impuesto
fixtures/index.ts       Fixtures: inyectan los Page Objects y el paso con evidencia ("step")
pages/                  Page Objects, uno por pantalla
  BasePage.ts             Encabezado común: título y carrito (enlace y contador)
  LoginPage.ts
  InventoryPage.ts
  CartPage.ts
  CheckoutInformationPage.ts
  CheckoutOverviewPage.ts
  CheckoutCompletePage.ts
tests/                  Especificaciones de prueba
  cas01-compra-completa.spec.ts
utils/money.ts          Formato de montos y cálculo de totales esperados
documentacion/          Análisis, escenarios y evidencias de hallazgos
playwright.config.ts    Configuración: ambiente, reportes y evidencias
```

**Capas:** el *test* describe el flujo de negocio y las validaciones; los *Page Objects* saben cómo interactuar con cada pantalla; los *datos* y *utilidades* están separados para poder cambiarlos sin tocar el flujo.

## Decisiones técnicas

| Tema | Decisión | Motivo |
|---|---|---|
| Patrón | Page Object Model con una `BasePage` para el encabezado | Los selectores viven en un solo lugar; si la UI cambia, se corrige una clase y no cada test. El encabezado (título, carrito) se repite en todas las pantallas internas. |
| Fixtures | Los Page Objects se inyectan como fixtures de Playwright | El test declara lo que necesita y no instancia clases; cada test obtiene una página aislada. |
| Locators | `getByTestId` sobre el atributo `data-test` (`testIdAttribute` en la configuración) y `getByRole` para los botones de producto | `data-test` es estable frente a cambios de estilo o textos. Los productos se ubican por su nombre visible y el botón por su rol, porque algunos `data-test` de productos contienen caracteres especiales. |
| Aserciones | URL de cada pantalla, título, contador del carrito, cambio del botón a *Remove*, productos en carrito y resumen, montos exactos y confirmación | Cada paso verifica el estado de negocio, no solo que la acción no falle. |
| Montos | Precios en centavos; subtotal, impuesto (8 %) y total esperados calculados en `utils/money.ts` | Evita errores de redondeo con decimales y deja explícita la regla de cálculo. |
| Sincronización | Sin esperas fijas (`waitForTimeout`). Solo aserciones *web-first* (`await expect(...)`) y el auto-wait de las acciones | Playwright reintenta cada aserción hasta que se cumple o vence el tiempo; el test se adapta a la velocidad real de la aplicación. |
| Evidencias | Fixture `step`: envuelve `test.step` y adjunta una captura al final de cada paso | Evidencia trazable paso a paso en el reporte, sin repetir código en el test. |
| Datos sensibles | Password en `.env` (ignorado por git), leído con `dotenv` | Cumple la regla de no publicar credenciales. |
| Ambientes | `BASE_URL` configurable por variable de entorno | El mismo código corre contra otro ambiente sin cambios. |

## Supuestos, limitaciones y mejoras futuras

**Supuestos**
- La tasa de impuesto es 8 % del subtotal (observada: $39.98 → $3.20).
- SauceDemo es un sitio público compartido; su disponibilidad no depende de este proyecto.

**Limitaciones**
- Se ejecuta solo en Chromium (escritorio).
- Solo CAS01 está automatizado; CAS02 y CAS03 están diseñados y documentados.
- No se valida el contenido del recibo PDF.

**Mejoras futuras**
- Automatizar CAS02 y CAS03 (este último como defecto conocido con `test.fail()`).
- Reutilizar la sesión con `storageState` en escenarios que no prueban el login.
- Agregar Firefox, WebKit y viewport móvil; ejecutar en CI (GitHub Actions) publicando el reporte.

## Uso de inteligencia artificial

Se utilizó **Claude** como asistente para estructurar el análisis, proponer casos de prueba y redactar borradores de código y documentación. Todo fue revisado, ejecutado y validado contra la aplicación real. Durante la exploración se corrigieron supuestos iniciales de la IA (por ejemplo, la interpretación del límite de productos en el carrito) con evidencia obtenida directamente del sitio.
