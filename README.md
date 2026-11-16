# Spot&Fix - Aplicación Móvil Institucional

Aplicación móvil nativa multiplataforma (Android & iOS) para el reporte, supervisión, trazabilidad y solución oportuna de incidencias de infraestructura y equipamiento en instituciones educativas.

Desarrollada con **React Native**, **Expo SDK 58**, **TypeScript** y **SQLite** embebido para persistencia relacional local sin dependencias de servidores externos.

---

## 🚀 Inicio Rápido

### Prerrequisitos
- **Node.js** v20+ o v24+
- Dispositivo móvil con la app **Expo Go** instalada ([Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) o [App Store](https://apps.apple.com/app/expo-go/id982107779)), o un emulador de Android/iOS.

### 1. Iniciar la aplicación
Desde la raíz del proyecto:
```bash
npm start
```
O directamente dentro de la carpeta `mobile/`:
```bash
cd mobile
npm start
```

### 2. Abrir en tu teléfono
- **Android**: Abre **Expo Go** y escanea el código QR que aparece en la terminal.
- **iOS**: Abre la app **Cámara** y escanea el código QR.
- **Web**: Presiona `w` en la consola para previsualizar en el navegador.

---

## 👥 Cuentas y Roles Preconfigurados (Demo)

La aplicación cuenta con un selector instantáneo de rol (**"Cambiar Rol"**) en la cabecera superior y en la pantalla de inicio de sesión:

| Rol | Correo Institucional | Nombre | Permisos y Capacidades |
|---|---|---|---|
| **Usuario** (Estudiante) | `estudiante@institucion.edu` | Farid Vicaña | Reportar incidencias (<2 min, 3 pasos, foto opcional), ver historial propio, editar/cancelar reportes en "recibida", detectar y apoyar duplicados. |
| **Usuario** (Docente) | `profesor@institucion.edu` | Dra. Elena Ramos | Reportes de aulas y laboratorios. |
| **Directivo Autorizado** | `directivo@institucion.edu` | Ing. Carlos Mendoza | Bandeja de incidencias institucional, filtros combinados, asignación de áreas y técnicos, cambio de estado con auditoría, agregar notas de seguimiento y métricas. |
| **Administrador TI** | `admin@institucion.edu` | Administrador TI Spot&Fix | Control de acceso total, gestión de catálogos maestros (categorías y ubicaciones) y asignación/revocación de roles de usuario. |

---

## 📱 Funcionalidades Implementadas

### 1. Rol Usuario (Estudiantes y Personal)
- **RF-001 & RNF-008:** Formulario guiado en 3 pasos (< 2 minutos) con categoría, ubicación física (edificio/piso/aula), descripción detallada y foto opcional.
- **RNF-009:** Compresión automática de imágenes adjuntas garantizando archivos menores a 5 MB.
- **RF-011:** Detección de posibles reportes duplicados en la misma ubicación antes de guardar, permitiendo apoyar (*upvote*) el reporte existente sin duplicar datos.
- **RF-005:** Historial de reportes propios con fecha de creación y estado actualizado.
- **RF-012:** Edición de contenido y cancelación de reporte únicamente mientras el estado permanezca en **"Recibida"** (bloqueado en "En proceso").

### 2. Rol Directivo Autorizado (Supervisión y Gestión)
- **RF-002 & RF-009:** Bandeja de incidencias institucional con búsqueda textual y filtros combinados (estado, prioridad, categoría y ubicación).
- **RF-003:** Máquina de estados formal: `recibida` → `en proceso` → `solucionada` / `no procedente`.
- **RF-007:** Asignación de nivel de prioridad: `alta`, `media`, `baja`.
- **RF-008:** Asignación del área responsable (Mantenimiento, Redes, Electricidad, etc.) y técnico asignado.
- **RF-010:** Bitácora de seguimiento con comentarios públicos entre directivos y reportantes.
- **RNF-013:** Historial de auditoría inmutable por cada cambio de estado (usuario, fecha, hora, estado anterior, estado nuevo y observaciones).
- **RF-015:** Tablero de estadísticas con KPIs (tiempo promedio de solución en días, distribución por categoría y estado) y botón de **Exportación a PDF** oficial institucional listo para imprimir o compartir.

### 3. Rol Administrador (Plataforma y Catálogos)
- **RF-013:** Gestión de catálogos: creación y activación/desactivación de categorías de incidencias y ubicaciones físicas jerárquicas (edificio, piso, aula).
- **RF-014:** Administración de cuentas institucionales con asignación y revocación dinámica de roles (`usuario`, `directivo`, `admin`).

---

## 🛠️ Arquitectura Técnica

```text
mobile/src/
├── types/                # Definiciones TypeScript de entidades y estados
├── theme/                # Paleta institucional con contraste accesible WCAG
├── database/             # Motor SQLite con migraciones y datos semilla
│   ├── schema.ts         # Tablas relacionales (users, incidents, categories, etc.)
│   ├── seed.ts           # Datos iniciales institucionales y auditoría
│   └── database.ts       # Consultas SQL asíncronas y reactivas
├── context/
│   ├── AuthContext.tsx   # Sesión, control RBAC y selector rápido de roles
│   └── IncidentContext.tsx # Gestión reactiva de incidencias, filtros y estados
├── services/
│   ├── imageService.ts   # Procesamiento y compresión de fotos (< 5 MB)
│   └── pdfService.ts     # Generación de informe ejecutivo en PDF
├── components/           # Componentes UI reutilizables
│   ├── Header.tsx        # Cabecera con selector de roles
│   ├── IncidentCard.tsx  # Tarjeta de incidencia con estado y apoyos
│   ├── StatusBadge.tsx   # Insignia de estado institucional
│   ├── PriorityBadge.tsx # Insignia de prioridad
│   └── DuplicateModal.tsx# Modal interactivo avisador de duplicados
└── screens/              # Pantallas por módulo
    ├── auth/             # Login institucional y accesos demo
    ├── user/             # Mis Reportes, Crear Incidencia (3 pasos), Explorar
    ├── director/         # Bandeja de entrada, Detalle/Gestión, Métricas
    └── admin/            # Catálogos (Categorías/Ubicaciones), Usuarios y Roles
```

---

## 📋 Validación OpenSpec

El aplicativo se encuentra 100% alineado con las especificaciones OpenSpec en `openspec/specs/`:

```bash
openspec validate --specs
# Totals: 13 passed, 0 failed (13 items)
```

