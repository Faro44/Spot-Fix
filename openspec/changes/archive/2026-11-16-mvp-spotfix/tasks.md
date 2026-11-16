
9--# Tasks: Implementación MVP Spot&Fix

## 1. Configuración de Entorno y Base de Datos

- [x] 1.1 Inicializar proyecto Expo con TypeScript en directorio `mobile/`
- [x] 1.2 Configurar dependencias: `expo-sqlite`, `expo-image-picker`, `@expo/vector-icons`, `expo-print`
- [x] 1.3 Diseñar esquema de base de datos relacional (tablas `users`, `categories`, `locations`, `incidents`, `audit_logs`)
- [x] 1.4 Implementar capa de acceso a datos asíncrona y datos semilla (`seed.ts`)

## 2. Autenticación y Control de Acceso (RBAC)

- [x] 2.1 Implementar `AuthContext` con persistencia de sesión y selector de cuentas demo
- [x] 2.2 Diseñar pantalla de inicio de sesión con correo institucional y validación de contraseñas
- [x] 2.3 Configurar navegación condicional por rol (Usuario, Directivo, Administrador)

## 3. Módulo de Incidencias para Usuarios

- [x] 3.1 Construir formulario de reporte guiado en 3 pasos (< 2 minutos)
- [x] 3.2 Integrar captura fotográfica con compresión automática a menos de 5 MB
- [x] 3.3 Implementar modal detector de reportes duplicados y soporte comunitario (upvoting)
- [x] 3.4 Desarrollar pantalla de historial propio con edición y cancelación en estado "recibida"

## 4. Módulo de Supervisión Directiva y Reportería

- [x] 4.1 Desarrollar bandeja de incidencias con buscador y filtros combinados
- [x] 4.2 Crear pantalla de detalle con actualización de estado, priorización y asignación de área/técnico
- [x] 4.3 Implementar sistema de comentarios y registro inmutable de auditoría (RNF-013)
- [x] 4.4 Desarrollar tablero de métricas con cálculo de tiempos promedio y exportación a PDF (RF-015)

## 5. Módulo de Administración de Plataforma

- [x] 5.1 Implementar pantalla de administración de catálogos (categorías y ubicaciones jerárquicas)
- [x] 5.2 Implementar gestión de usuarios y reasignación de roles
- [x] 5.3 Validar tipado estricto TypeScript y especificaciones OpenSpec

## 6. Validación y Demostración del Prototipo (Flujo A: Login y Reporte)

- [x] 6.1 Iniciar el servidor de desarrollo Expo (`npm start`) y verificar el despliegue del prototipo en Expo Go o entorno web
- [x] 6.2 Validar el inicio de sesión institucional y la conmutación de usuario demo (`estudiante@institucion.edu`) mediante `AuthContext`
- [x] 6.3 Ejecutar y cronometrar el flujo guiado de reporte en 3 pasos (< 2 min) registrando una incidencia de prueba con foto comprimida
- [x] 6.4 Validar la detección de incidencias duplicadas provocando una coincidencia de categoría/ubicación y probar el mecanismo de apoyo comunitario (upvoting)
- [x] 6.5 Verificar en la pantalla "Mis Reportes" la persistencia de la incidencia en SQLite local, comprobando las acciones de edición y cancelación en estado "recibida"


