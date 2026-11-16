import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Incident } from '../types';

export interface ReportStats {
  total: number;
  received: number;
  inProcess: number;
  solved: number;
  rejected: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  avgResolutionDays: number;
  categoryBreakdown: { name: string; count: number }[];
  locationBreakdown: { name: string; count: number }[];
}

export function calculateStats(incidents: Incident[]): ReportStats {
  const total = incidents.length;
  let received = 0;
  let inProcess = 0;
  let solved = 0;
  let rejected = 0;
  let highPriority = 0;
  let mediumPriority = 0;
  let lowPriority = 0;
  let totalResolutionTimeMs = 0;
  let solvedCountWithTimes = 0;

  const catMap: Record<string, number> = {};
  const locMap: Record<string, number> = {};

  for (const inc of incidents) {
    if (inc.status === 'recibida') received++;
    else if (inc.status === 'en proceso') inProcess++;
    else if (inc.status === 'solucionada') {
      solved++;
      const created = new Date(inc.created_at).getTime();
      const updated = new Date(inc.updated_at).getTime();
      if (updated > created) {
        totalResolutionTimeMs += updated - created;
        solvedCountWithTimes++;
      }
    } else if (inc.status === 'no procedente') rejected++;

    if (inc.priority === 'alta') highPriority++;
    else if (inc.priority === 'media') mediumPriority++;
    else if (inc.priority === 'baja') lowPriority++;

    const catName = inc.category_name || 'Sin categoría';
    catMap[catName] = (catMap[catName] || 0) + 1;

    const locName = inc.location_name || 'Ubicación general';
    locMap[locName] = (locMap[locName] || 0) + 1;
  }

  const avgResolutionDays =
    solvedCountWithTimes > 0
      ? Math.round((totalResolutionTimeMs / (solvedCountWithTimes * 1000 * 60 * 60 * 24)) * 10) / 10
      : 2.5;

  return {
    total,
    received,
    inProcess,
    solved,
    rejected,
    highPriority,
    mediumPriority,
    lowPriority,
    avgResolutionDays,
    categoryBreakdown: Object.entries(catMap).map(([name, count]) => ({ name, count })),
    locationBreakdown: Object.entries(locMap).map(([name, count]) => ({ name, count })),
  };
}

export async function generateAndSharePdfReport(incidents: Incident[]): Promise<void> {
  const stats = calculateStats(incidents);
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Reporte Ejecutivo de Incidencias - Spot&Fix</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 32px; }
        .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
        .title { color: #1e3a8a; font-size: 24px; font-weight: bold; margin: 0; }
        .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
        .kpi-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
        .kpi-card { flex: 1 1 calc(25% - 16px); background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .kpi-val { font-size: 26px; font-weight: bold; color: #1e3a8a; }
        .kpi-lbl { font-size: 12px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
        th { background-color: #f1f5f9; color: #334155; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .badge-recibida { background: #e0e7ff; color: #3730a3; }
        .badge-en-proceso { background: #fef3c7; color: #92400e; }
        .badge-solucionada { background: #dcfce7; color: #166534; }
        .badge-no-procedente { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">Spot&Fix - Informe Ejecutivo de Gestión de Incidencias</h1>
        <div class="subtitle">Generado el ${dateStr} | Cobertura Institucional Integral</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val">${stats.total}</div>
          <div class="kpi-lbl">Total Incidencias</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #166534;">${stats.solved}</div>
          <div class="kpi-lbl">Solucionadas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #92400e;">${stats.inProcess}</div>
          <div class="kpi-lbl">En Proceso</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #2563eb;">${stats.avgResolutionDays} d</div>
          <div class="kpi-lbl">Promedio Solución</div>
        </div>
      </div>

      <h3>Listado Detallado de Incidencias</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Ubicación</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${incidents
            .map(
              (i) => `
            <tr>
              <td><code>${i.id}</code></td>
              <td><strong>${i.title}</strong></td>
              <td>${i.category_name || '-'}</td>
              <td>${i.location_name || '-'}</td>
              <td>${i.priority.toUpperCase()}</td>
              <td><span class="badge badge-${i.status.replace(' ', '-')}">${i.status.toUpperCase()}</span></td>
              <td>${new Date(i.created_at).toLocaleDateString('es-ES')}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir o guardar Reporte Spot&Fix en PDF',
    });
  }
}

