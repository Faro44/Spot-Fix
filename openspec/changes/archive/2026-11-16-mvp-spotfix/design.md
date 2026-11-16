# Design: Spot&Fix MVP Architecture

## Context
Spot&Fix requiere operar en smartphones Android e iOS utilizados por estudiantes, docentes y directivos dentro del campus educativo. La aplicación debe ser liviana, intuitiva y capaz de funcionar de manera autónoma con persistencia local sin depender de configuraciones complejas de servidores en su etapa inicial.

## Goals / Non-Goals

**Goals:**
- Desarrollar una interfaz nativa fluida con React Native y Expo SDK 58.
- Implementar persistencia de datos relacionales íntegramente local con `expo-sqlite`.
- Garantizar tiempos de registro de incidencias menores a 2 minutos en un flujo de máximo 3 pasos.
- Proveer trazabilidad y auditoría de cada modificación de estado.
- Permitir la exportación de métricas y estadísticas a documentos PDF.

**Non-Goals:**
- Sincronización en la nube multi-nodo en tiempo real (planificada para fases posteriores).
- Integración con pasarelas de pago o compras de suministros de mantenimiento.

## Decisions

- **React Native con Expo:** Permite desarrollo multiplataforma ágil compatible con Expo Go para pruebas inmediatas en dispositivos físicos.
- **SQLite Embebido (`expo-sqlite`):** Motor SQL transaccional y robusto que soporta índices, claves foráneas y consultas estructuradas en el almacenamiento del dispositivo.
- **Control de Acceso Basado en Roles (RBAC):** Separación estricta de vistas y acciones entre Usuario, Directivo Autorizado y Administrador con conmutador rápido de prueba.
- **Compresión de Imágenes en Cliente:** Reducción automática de resolución a 1200px máx y compresión JPEG antes del almacenamiento para optimizar espacio y rendimiento.

## Risks / Trade-offs

- **Persistencia local en el dispositivo:** Si el usuario desinstala la aplicación sin respaldo, los datos locales se pierden. Mitigación: inclusión de función de exportación a PDF y copias de seguridad planificadas.
- **Compatibilidad de permisos de cámara:** Requiere validación de permisos en tiempo de ejecución en Android e iOS. Mitigación: manejo explícito de excepciones y selección alternativa desde la galería.

## Prototype Validation Strategy (Flow A: Login & User Reporting)

Para la verificación, demostración y pruebas del prototipo operativo, se establece la siguiente estrategia de ejecución técnica:
- **Entorno de ejecución:** Servidor de desarrollo Expo Metro (`npm start`) con previsualización en Expo Go (Android/iOS) y soporte web (`npm run web`) para validación rápida de interfaz.
- **Ruta crítica de interacción del prototipo:**
  1. *Autenticación y RBAC:* Validación del inicio de sesión manual contra la tabla `users` de SQLite local y conmutación instantánea mediante el selector superior de cuentas demo (`estudiante@institucion.edu` para rol Usuario).
  2. *Formulario guiado en 3 pasos:* Medición del tiempo de reporte (< 2 minutos) cubriendo:
     - Paso 1: Selección de categoría (ej. Electricidad, Mobiliario).
     - Paso 2: Selección de ubicación jerárquica (ej. Pabellón A > Aula 101).
     - Paso 3: Título, descripción y adjunto de imagen (con compresión en cliente a < 5 MB).
  3. *Detección de duplicados:* Despliegue de `DuplicateModal` al detectar coincidencia de categoría y ubicación con incidencias activas existentes en SQLite, permitiendo sumar apoyo comunitario (*upvote*) en lugar de generar reportes redundantes.
  4. *Ciclo de vida en historial propio:* Consulta de la incidencia en la pantalla "Mis Reportes", verificando persistencia inmediata y disponibilidad de edición/cancelación mientras conserve el estado "recibida".


