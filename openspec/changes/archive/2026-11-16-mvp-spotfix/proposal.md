# Proposal: Spot&Fix MVP

## Why
La comunidad educativa carece de un canal centralizado y ágil para reportar fallas en infraestructura, mobiliario y equipos tecnológicos dentro del campus. Actualmente, los reportes se gestionan de manera informal, provocando demoras en la atención, falta de trazabilidad y duplicidad de reportes sobre una misma avería. Este MVP proporciona una solución móvil institucional para registrar incidencias en menos de dos minutos, permitiendo a los directivos supervisar, asignar responsables y dar seguimiento oportuno con un registro transparente y auditable de cada cambio de estado.

## What Changes
Se implementa la primera versión operativa (MVP) de Spot&Fix:
- Aplicativo móvil desarrollado en React Native y Expo con base de datos embebida SQLite local.
- Sistema de autenticación con cuentas institucionales y control de acceso basado en roles (Usuario, Directivo Autorizado y Administrador).
- Flujo guiado de reporte de incidencias en 3 pasos con categorías, ubicaciones jerárquicas y fotos comprimidas.
- Detección de reportes duplicados con opción de soporte comunitario (upvoting).
- Bandeja de supervisión directiva con filtros combinados, actualización de estados, priorización, asignación de responsables y notas de seguimiento.
- Auditoría inmutable de cambios de estado y panel estadístico con exportación a PDF.

## Capabilities

### New Capabilities
<!-- No brand new root domains; all core MVP domains refine institutional specifications -->

### Modified Capabilities
- `auth/authentication`: Verificación de identidad institucional con credenciales y gestión de sesiones.
- `incidents/submission`: Formulario guiado de 3 pasos (< 2 min), categorización, ubicación física y fotos comprimidas.
- `incidents/duplicates`: Alerta temprana de incidencias duplicadas y mecanismo de apoyo comunitario (upvoting).
- `supervision/status-workflow`: Flujo de estados, asignación de responsables/áreas y registro de auditoría.

## Impact
- **Usuarios (Estudiantes y Docentes):** Capacidad de registrar fallas en menos de 2 minutos y consultar el avance en tiempo real.
- **Directivos:** Panel centralizado para triaje, asignación y seguimiento de tareas de mantenimiento.
- **Infraestructura:** Despliegue móvil sin dependencias de servidores pesados gracias al motor SQLite local (`expo-sqlite`).
