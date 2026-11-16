# Spot&Fix: Levantamiento de Requisitos Funcionales y No Funcionales

## 1. Información General del Proyecto

- **Nombre del Proyecto:** Spot&Fix
- **Responsable del Proyecto:** Farid Rodrigo Vicaña Tenorio
- **Fecha de Inicio:** _Por definir_
- **Fecha de Finalización (estimada):** _Por definir_
- **Descripción Breve del Proyecto:** Spot&Fix es una aplicación que permite a los estudiantes y al personal de la institución reportar problemas de infraestructura o fallas en materiales y equipos. Los directivos autorizados pueden revisar los reportes, dar seguimiento y coordinar su solución lo antes posible.

---

## 2. Objetivos del Proyecto

**Objetivo General:** Desarrollar una aplicación que facilite el reporte, la supervisión y la solución oportuna de problemas dentro de la institución educativa.

**Objetivos Específicos:**

1. Permitir que los usuarios registren incidencias indicando la categoría, ubicación y descripción del problema, y adjunten una fotografía cuando sea posible.
2. Facilitar que los directivos autorizados revisen, clasifiquen y actualicen el estado de cada reporte.
3. Mejorar el seguimiento de las incidencias para priorizar los problemas y procurar que se solucionen lo más pronto posible.

---

## 3. Requisitos Funcionales

| ID | Descripción | Prioridad | Responsable | Notas Adicionales |
|---|---|---|---|---|
| RF-001 | Registrar un reporte de problema con categoría, ubicación, descripción y foto opcional. | Alta | Usuario | Validar los campos obligatorios. |
| RF-002 | Permitir a los directivos autorizados consultar los reportes y ver sus detalles. | Alta | Directivo autorizado | El acceso debe estar restringido según el rol. |
| RF-003 | Actualizar el estado de una incidencia (recibida, en proceso, solucionada o no procedente). | Alta | Directivo autorizado | Guardar la fecha de actualización y observaciones. |
| RF-004 | Iniciar sesión y autenticar a cada usuario según su rol (usuario, directivo autorizado, administrador). | Alta | Sistema | Usar correo institucional. |
| RF-005 | Consultar el historial y estado de sus propios reportes. | Alta | Usuario | Mostrar fecha de creación y última actualización. |
| RF-006 | Notificar al usuario cuando cambie el estado de su reporte. | Media | Sistema | En la app o por correo. |
| RF-007 | Asignar prioridad (alta, media, baja) a cada incidencia. | Alta | Directivo autorizado | Según riesgo e impacto. |
| RF-008 | Asignar la incidencia a un responsable o área (mantenimiento, sistemas, etc.). | Media | Directivo autorizado | Registrar al responsable. |
| RF-009 | Buscar y filtrar reportes por categoría, ubicación, estado, prioridad y fecha. | Media | Directivo autorizado | Combinar filtros. |
| RF-010 | Agregar comentarios u observaciones durante el seguimiento. | Media | Directivo autorizado | Visibles para quien reportó. |
| RF-011 | Avisar de posibles duplicados y permitir apoyar un reporte existente. | Baja | Sistema / Usuario | Mide cuántos están afectados. |
| RF-012 | Editar o cancelar un reporte mientras esté en "recibida". | Baja | Usuario | Bloqueado una vez en proceso. |
| RF-013 | Gestionar categorías y ubicaciones (crear, editar, desactivar). | Media | Administrador | Ej: edificio, piso, aula. |
| RF-014 | Gestionar usuarios y asignar o retirar roles. | Alta | Administrador | Solo el admin da permisos. |
| RF-015 | Generar estadísticas (por categoría, ubicación, estado, tiempo promedio de solución). | Baja | Directivo autorizado | Exportar a PDF o Excel. |

---

## 4. Requisitos No Funcionales

| ID | Descripción | Categoría | Prioridad | Notas Adicionales |
|---|---|---|---|---|
| RNF-001 | La aplicación debe ser sencilla e intuitiva para que los usuarios puedan reportar problemas sin dificultad. | Usabilidad | Alta | Textos claros y formularios simples. |
| RNF-002 | La aplicación debe proteger los datos y limitar el acceso a reportes y funciones según el rol del usuario. | Seguridad | Alta | Se recomienda inicio de sesión para directivos. |
| RNF-003 | La aplicación debe cargar y guardar los reportes en un tiempo razonable bajo condiciones normales de uso. | Rendimiento | Media | El tiempo concreto se definirá durante las pruebas. |
| RNF-004 | Estar disponible al menos el 99% del tiempo en horario institucional. | Disponibilidad | Alta | Mantenimientos fuera de horario. |
| RNF-005 | Funcionar en Android, iOS y navegadores modernos. | Compatibilidad | Alta | Diseño responsive. |
| RNF-006 | Cifrar contraseñas y usar conexiones seguras (HTTPS). | Seguridad | Alta | Nunca guardar contraseñas en texto plano. |
| RNF-007 | Mostrar los datos personales del reportante solo al personal autorizado. | Privacidad | Alta | Cumplir la normativa de protección de datos. |
| RNF-008 | Poder registrar un reporte en menos de 2 minutos. | Usabilidad | Alta | Máximo 3 pasos. |
| RNF-009 | Comprimir las imágenes adjuntas y limitar su tamaño. | Rendimiento | Media | Máx. sugerido 5 MB. |
| RNF-010 | Soportar más usuarios y reportes sin perder rendimiento. | Escalabilidad | Media | Pensar en crecimiento por periodos. |
| RNF-011 | Mantener código modular y documentado. | Mantenibilidad | Media | Facilita cambios futuros. |
| RNF-012 | Hacer copias de seguridad periódicas de la información. | Respaldo | Media | Semanal como mínimo. |
| RNF-013 | Registrar cada cambio de estado con usuario, fecha y hora. | Trazabilidad | Media | Historial de auditoría. |
| RNF-014 | Tener buen contraste, texto legible y soporte para lectores de pantalla. | Accesibilidad | Media | Seguir pautas WCAG. |
| RNF-015 | Interfaz en español con mensajes de error claros. | Usabilidad | Baja | |

---

## 5. Restricciones del Proyecto

- **Restricciones Técnicas:** La aplicación necesitará dispositivos compatibles y conexión a internet para enviar y consultar reportes. Las funciones disponibles dependerán de la plataforma y los recursos tecnológicos del proyecto.
- **Restricciones de Tiempo:** Las fechas de desarrollo, pruebas y entrega aún deben ser definidas por el equipo responsable.
- **Restricciones de Presupuesto:** El desarrollo debe ajustarse a los recursos disponibles; se priorizarán herramientas gratuitas o de bajo costo si el presupuesto es limitado.

---

## 6. Suposiciones

- Los estudiantes y el personal podrán acceder a la aplicación desde un dispositivo compatible.
- La institución designará directivos o responsables autorizados para revisar y gestionar las incidencias.
- Los usuarios describirán los problemas de manera clara y proporcionarán una ubicación útil para identificarlos.

---

## 7. Aprobaciones

| Nombre | Rol | Firma | Fecha |
|---|---|---|---|
| | | | |
| | | | |

---

## 8. Diagrama de Clases

![Diagrama de clases Spot&Fix](https://t90171576000.p.clickup-attachments.com/t90171576000/2e62c139-4c9b-4e5c-9554-9238c68f2b38/mermaid-diagram.png?view=open)

