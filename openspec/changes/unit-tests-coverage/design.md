# Design: Automated Unit Testing Architecture & Interface Verification

## Context
Spot&Fix cuenta con una arquitectura móvil estructurada en TypeScript con Expo SDK 58, capa de persistencia relacional (`expo-sqlite` y fallback en memoria), contextos globales (`AuthContext`, `IncidentContext`), servicios de procesamiento (`imageService`, `pdfService`) y 9 pantallas interactivas organizadas por roles. Para garantizar estabilidad continua y asegurar que todas las respuestas de la interfaz estén completas y conectadas, se diseña un arnés de pruebas unitarias enfocado en la lógica de negocio, transacciones relacionales, validación de estados y manejadores de interacción de las vistas.

## Goals / Non-Goals

**Goals:**
- Configurar un entorno de pruebas unitarias automatizadas con **Jest** y **ts-jest** optimizado para TypeScript y React Native.
- Cobertura de pruebas unitarias sobre la capa de datos (`database.ts`, `schema.ts`, `seed.ts`): creación de tablas, consultas de catálogo, inserción de incidencias y auditoría.
- Cobertura de pruebas unitarias sobre la lógica de autenticación y control de acceso RBAC (`AuthContext`): login con cuentas institucionales, bloqueo por credenciales erróneas y conmutación de roles.
- Cobertura de pruebas unitarias sobre las reglas de negocio de incidencias:
  - Formulario en 3 pasos con validación de campos obligatorios.
  - Algoritmo de detección de duplicados por categoría y ubicación.
  - Mecanismo de votación comunitaria (*upvoting*).
  - Políticas de edición y cancelación restringidas a estado "recibida" (RF-012).
  - Transiciones de estado permitidas y generación obligatoria de bitácora inmutable en `audit_logs` (RNF-013).
- Cobertura de pruebas unitarias para servicios analíticos: cálculo de tiempos promedio, distribución porcentual y exportación a PDF (`pdfService`).
- Verificación exhaustiva de manejadores de eventos en las 9 pantallas de la interfaz para comprobar que ninguna acción quede como stub o incompleta.

**Non-Goals:**
- Pruebas E2E de caja negra en emuladores físicos con Appium/Detox (se reservan para la etapa de despliegue en tiendas).
- Pruebas de estrés con millones de registros concurrentes (el modelo opera sobre SQLite local por dispositivo).

## Decisions

- **Jest como framework principal de pruebas:** Proveedor estándar de la industria en el ecosistema React / React Native, con soporte nativo de aserciones, mocks, espías y ejecución paralela de suites.
- **Mocks livianos para APIs nativas de Expo:** Creación de un archivo `jest.setup.ts` con mocks mínimos para `expo-sqlite`, `expo-image-picker`, `expo-print` y `expo-sharing`, permitiendo que las pruebas se ejecuten en Node.js a alta velocidad (< 5 segundos para toda la suite).
- **Pruebas de verificación funcional de interfaz:** Evaluación de los controladores y respuestas de cada pantalla comprobando que todos los botones (`onPress`), envíos de formularios (`onSubmit`), modales y alertas (`Alert.alert`) estén completamente implementados y conectados a los contextos o base de datos.

## Risks / Trade-offs

- **[Riesgo] Divergencia entre el mock de SQLite y el motor nativo del dispositivo** → **Mitigación:** La suite de pruebas probará tanto la lógica sobre el motor en memoria como la conformidad sintáctica de las consultas SQL definidas en `schema.ts`.
- **[Riesgo] Dependencia de módulos nativos de Expo en entorno Node.js** → **Mitigación:** Aislamiento de llamadas nativas mediante wrappers en `services/` y `jest.setup.ts` con tipado estricto.

