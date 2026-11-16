# Tasks: Automated Unit Testing Suite and Interface Verification

## 1. Configuración del Entorno de Pruebas

- [ ] 1.1 Configurar dependencias de desarrollo (`jest`, `ts-jest`, `@types/jest`) y script `"test"` en `mobile/package.json` y verificar con `npm test -- --version`
- [ ] 1.2 Crear archivo de configuración `jest.config.js` y arnés de mocks nativos `jest.setup.ts` para APIs de Expo (`expo-sqlite`, `expo-print`, `expo-sharing`) y verificar ejecución sin errores de tipado

## 2. Pruebas Unitarias de Capa de Datos y Esquema

- [ ] 2.1 Crear suite `tests/database.test.ts` para verificar integridad del esquema SQL, inserción y recuperación de datos semilla (`SEED_USERS`, `SEED_CATEGORIES`, `SEED_LOCATIONS`)
- [ ] 2.2 Implementar pruebas unitarias para creación de incidencias, persistencia relacional y generación de registro inicial en `audit_logs`
- [ ] 2.3 Implementar pruebas unitarias para administración de catálogos (`saveCategory`, `toggleCategoryStatus`, `saveLocation`, `toggleLocationStatus`)

## 3. Pruebas Unitarias de Autenticación y Control de Acceso (RBAC)

- [ ] 3.1 Crear suite `tests/auth.test.ts` para validar inicio de sesión exitoso con credenciales institucionales y rechazo de credenciales erróneas
- [ ] 3.2 Implementar pruebas de conmutación de cuentas demo en `AuthContext` y verificar permisos correspondientes a cada rol (`usuario`, `directivo`, `admin`)
- [ ] 3.3 Implementar pruebas para la regla de seguridad que impide la degradación del propio rol de administrador activo

## 4. Pruebas Unitarias de Ciclo de Vida de Incidencias y Duplicados

- [ ] 4.1 Crear suite `tests/incidents.test.ts` para validar el algoritmo de detección de duplicados por categoría y ubicación (`fetchPotentialDuplicates`)
- [ ] 4.2 Implementar pruebas unitarias para el mecanismo de apoyo comunitario (*upvoting*) y verificar incremento atómico del contador
- [ ] 4.3 Implementar pruebas unitarias para la política RF-012: validar que la edición y cancelación solo procedan en estado "recibida" y lancen excepción en otros estados
- [ ] 4.4 Implementar pruebas unitarias para la máquina de estados directiva (*en evaluación*, *en proceso*, *solucionada*, *no procedente*) y verificar la creación obligatoria de bitácora en `audit_logs` (RNF-013)

## 5. Pruebas Unitarias de Servicios y Verificación Funcional de Vistas

- [ ] 5.1 Crear suite `tests/services.test.ts` para validar cálculo de métricas estadísticas (total, resueltas, tiempos promedio) y generación de parámetros HTML para PDF en `pdfService`
- [ ] 5.2 Implementar pruebas de compresión de imágenes en `imageService` validando redimensionamiento a 1200px máx y límite de 5 MB
- [ ] 5.3 Crear suite `tests/screens_verification.test.ts` para verificar que los manejadores de eventos, alertas y respuestas de las 9 pantallas de la interfaz (`LoginScreen`, `CreateReportScreen`, `UserReportsScreen`, `ExploreIncidentsScreen`, `DirectorInboxScreen`, `IncidentDetailScreen`, `StatisticsScreen`, `CatalogManagementScreen`, `UserManagementScreen`) tengan implementadas todas sus funciones y no contengan stubs o métodos vacíos
- [ ] 5.4 Ejecutar la suite completa con `npm test` y verificar cobertura integral con 100% de pruebas aprobadas

