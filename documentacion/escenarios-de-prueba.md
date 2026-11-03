# Escenarios de prueba — SauceDemo

Tres escenarios seleccionados: uno positivo, uno negativo y uno asociado a una regla de negocio.

| ID | Nombre | Tipo | Prioridad | Decisión |
|---|---|---|---|---|
| CAS01 | Compra completa de dos productos | Positivo | Alta | **Automatizado** |
| CAS02 | Inicio de sesión con usuario bloqueado | Negativo | Alta | Automatizable |
| CAS03 | No se debe poder finalizar una compra con el carrito vacío | Regla de negocio | Alta | Automatizable como defecto conocido |

> Las credenciales de práctica se publican en la pantalla de login de SauceDemo. En el proyecto el password se lee de la variable de entorno `SAUCE_PASSWORD` y nunca se versiona.

---

## CAS01 — Compra completa de dos productos

| Campo | Contenido |
|---|---|
| **Identificación** | **CAS01** · Compra completa de dos productos con usuario válido |
| **Propósito** | **Objetivo:** verificar que un usuario válido completa el flujo principal de negocio: login, catálogo, carrito, datos de envío, resumen y confirmación.<br>**Riesgo cubierto:** que el usuario no pueda comprar, o que el resumen muestre montos incorrectos (subtotal, impuesto o total). |
| **Preparación** | **Precondiciones:** sesión sin iniciar y carrito vacío.<br>**Datos:**<br>• Usuario `standard_user` y password compartido (`SAUCE_PASSWORD`).<br>• Productos: *Sauce Labs Backpack* ($29.99) y *Sauce Labs Bike Light* ($9.99).<br>• Datos de envío ficticios: nombre, apellido y código postal. |
| **Ejecución** | 1. Abrir la página de login (`/`).<br>2. Iniciar sesión con `standard_user`.<br>3. Agregar *Sauce Labs Backpack* al carrito.<br>4. Agregar *Sauce Labs Bike Light* al carrito.<br>5. Abrir el carrito.<br>6. Presionar *Checkout*.<br>7. Completar nombre, apellido y código postal, y presionar *Continue*.<br>8. Revisar el resumen y presionar *Finish*. |
| **Validación** | • Tras el login se muestra el título *Products* en `/inventory.html`.<br>• El contador del carrito pasa a 1 y luego a 2.<br>• El carrito lista exactamente los dos productos agregados.<br>• El resumen lista los dos productos; *Item total* es $39.98 (suma de los precios del catálogo); *Tax* es $3.20 (8 % del subtotal, redondeado); *Total* es $43.18 (*Item total* + *Tax*).<br>• Al finalizar se muestra *Checkout: Complete!* y *Thank you for your order!*, y el carrito queda vacío. |
| **Clasificación** | **Prioridad:** Alta.<br>**Tipo:** funcional, extremo a extremo, regresión (camino crítico).<br>**Técnicas:** caso de uso E2E; transición de estados (carrito vacío → con productos → orden confirmada → carrito vacío). |
| **Decisión** | **Automatizar (escenario seleccionado).** Es el flujo de mayor valor de negocio; es determinista, rápido y se repetirá en cada regresión. Recorre las seis pantallas, lo que justifica Page Objects y fixtures reutilizables por los demás escenarios.<br>**Implementación:** [`tests/cas01-compra-completa.spec.ts`](../tests/cas01-compra-completa.spec.ts) |

---

## CAS02 — Inicio de sesión con usuario bloqueado

| Campo | Contenido |
|---|---|
| **Identificación** | **CAS02** · Intento de inicio de sesión con `locked_out_user` |
| **Propósito** | **Objetivo:** verificar que una cuenta bloqueada no accede a la aplicación y recibe un mensaje claro.<br>**Riesgo cubierto:** acceso indebido de cuentas bloqueadas (seguridad) o un error ausente o ambiguo para el usuario. |
| **Preparación** | **Precondiciones:** sin sesión iniciada.<br>**Datos:** usuario `locked_out_user` y password compartido (`SAUCE_PASSWORD`). |
| **Ejecución** | 1. Abrir la página de login (`/`).<br>2. Ingresar `locked_out_user` y el password.<br>3. Presionar *Login*.<br>4. Intentar abrir `/inventory.html` directamente. |
| **Validación** | • El usuario permanece en la página de login.<br>• Se muestra el mensaje *Epic sadface: Sorry, this user has been locked out.*<br>• El acceso directo a `/inventory.html` no muestra el catálogo y regresa al login con el mensaje *Epic sadface: You can only access '/inventory.html' when you are logged in.* |
| **Clasificación** | **Prioridad:** Alta.<br>**Tipo:** funcional negativo; seguridad (control de acceso).<br>**Técnica:** partición de equivalencia. Dentro de la clase "credenciales inválidas" (usuario inexistente, password incorrecto, campos vacíos, usuario bloqueado) se elige *usuario bloqueado* por ser una regla de negocio específica. |
| **Decisión** | **Automatizable.** Es determinista y reutiliza el Page Object de login. No se eligió como escenario principal porque cubre una sola pantalla y tiene menor impacto de negocio que CAS01. |

---

## CAS03 — No se debe poder finalizar una compra con el carrito vacío

| Campo | Contenido |
|---|---|
| **Identificación** | **CAS03** · Bloqueo de la compra con 0 productos (límite inferior del carrito) |
| **Propósito** | **Objetivo:** verificar la regla de negocio de que una compra requiere al menos un producto.<br>**Riesgo cubierto:** generación de órdenes y comprobantes sin valor comercial, que afectan la integridad de los datos de ventas. |
| **Preparación** | **Precondiciones:** sesión iniciada con `standard_user` y carrito vacío.<br>**Datos:** credenciales como en CAS01; datos de envío ficticios. |
| **Ejecución** | 1. Iniciar sesión con `standard_user`.<br>2. Abrir el carrito sin agregar productos.<br>3. Presionar *Checkout*.<br>4. Completar los datos de envío y presionar *Continue*.<br>5. Presionar *Finish*. |
| **Validación** | **Resultado esperado (regla de negocio):** el sistema impide continuar o finalizar la compra (botón deshabilitado o mensaje de error) y no se genera ninguna orden.<br>**Resultado observado:** el sistema permite finalizar, muestra *Thank you for your order!* y genera un recibo PDF por $0.00. Se registra como defecto **H1** . |
| **Clasificación** | **Prioridad:** Alta.<br>**Tipo:** funcional negativo; regla de negocio.<br>**Técnicas:** análisis de valores límite sobre la cantidad de productos (0 inválido, 1 mínimo válido, 6 máximo); partición de equivalencia (carrito vacío / carrito con productos). |
| **Decisión** | **Automatizable como defecto conocido.** Es determinista y protege una regla crítica. Se marcaría con `test.fail()`: la suite queda en verde mientras el defecto exista y alerta cuando se corrija. No es el escenario principal porque su ejecución "exitosa" depende de esa marca. |
