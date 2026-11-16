import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CREATE_TABLES_SQL } from './schema';
import {
  SEED_USERS,
  SEED_CATEGORIES,
  SEED_LOCATIONS,
  SEED_INCIDENTS,
  SEED_COMMENTS,
  SEED_AUDIT_LOGS,
} from './seed';
import {
  User,
  Category,
  Location,
  Incident,
  IncidentStatus,
  IncidentPriority,
  IncidentComment,
  AuditLog,
  IncidentFilter,
  UserRole,
} from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

// En memoria para entornos donde SQLite nativo requiera mock o web
let memoryIncidents: Incident[] = [...SEED_INCIDENTS];
let memoryCategories: Category[] = [...SEED_CATEGORIES];
let memoryLocations: Location[] = [...SEED_LOCATIONS];
let memoryUsers: User[] = [...SEED_USERS];
let memoryComments: IncidentComment[] = [...SEED_COMMENTS];
let memoryAuditLogs: AuditLog[] = [...SEED_AUDIT_LOGS];
let memoryUpvotes: { id: string; incident_id: string; user_id: string; created_at: string }[] = [];

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    return null; // En web usamos la persistencia reactiva en memoria
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    const db = await SQLite.openDatabaseAsync('spotfix.db');
    dbInstance = db;
    await initDatabase(db);
    return db;
  } catch (error) {
    console.warn('SQLite no disponible en esta plataforma, utilizando motor en memoria:', error);
    return null;
  }
}

async function initDatabase(db: SQLite.SQLiteDatabase) {
  // Ejecutar creación de tablas
  await db.execAsync(CREATE_TABLES_SQL);

  // Verificar si requiere poblar datos semilla
  const userCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (!userCount || userCount.count === 0) {
    await seedDatabase(db);
  }
}

async function seedDatabase(db: SQLite.SQLiteDatabase) {
  for (const u of SEED_USERS) {
    await db.runAsync(
      'INSERT INTO users (id, email, name, role, department, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [u.id, u.email, u.name, u.role, u.department || null, u.created_at]
    );
  }

  for (const c of SEED_CATEGORIES) {
    await db.runAsync(
      'INSERT INTO categories (id, name, icon, description, is_active) VALUES (?, ?, ?, ?, ?)',
      [c.id, c.name, c.icon, c.description, c.is_active]
    );
  }

  for (const l of SEED_LOCATIONS) {
    await db.runAsync(
      'INSERT INTO locations (id, building, floor, room, is_active) VALUES (?, ?, ?, ?, ?)',
      [l.id, l.building, l.floor, l.room, l.is_active]
    );
  }

  for (const inc of SEED_INCIDENTS) {
    await db.runAsync(
      `INSERT INTO incidents 
      (id, title, description, category_id, location_id, reporter_id, status, priority, assigned_to_area, assigned_to_user, upvotes_count, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inc.id,
        inc.title,
        inc.description,
        inc.category_id,
        inc.location_id,
        inc.reporter_id,
        inc.status,
        inc.priority,
        inc.assigned_to_area || null,
        inc.assigned_to_user || null,
        inc.upvotes_count,
        inc.created_at,
        inc.updated_at,
      ]
    );
  }

  for (const comm of SEED_COMMENTS) {
    await db.runAsync(
      'INSERT INTO incident_comments (id, incident_id, user_id, user_name, user_role, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [comm.id, comm.incident_id, comm.user_id, comm.user_name, comm.user_role, comm.comment, comm.created_at]
    );
  }

  for (const a of SEED_AUDIT_LOGS) {
    await db.runAsync(
      'INSERT INTO audit_logs (id, incident_id, user_id, user_name, action, previous_state, new_state, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [a.id, a.incident_id, a.user_id, a.user_name, a.action, a.previous_state, a.new_state, a.notes, a.created_at]
    );
  }
}

// ==========================================
// MÉTODOS DE CONSULTA Y GESTIÓN DE INCIDENCIAS
// ==========================================

export async function fetchIncidents(filter?: IncidentFilter): Promise<Incident[]> {
  const db = await getDatabase();
  if (db) {
    let query = `
      SELECT i.*, 
             c.name as category_name, 
             (l.building || ' - ' || l.floor || ' - ' || l.room) as location_name,
             u.name as reporter_name,
             u.email as reporter_email
      FROM incidents i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN users u ON i.reporter_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filter?.status && filter.status !== 'all') {
      query += ' AND i.status = ?';
      params.push(filter.status);
    }
    if (filter?.priority && filter.priority !== 'all') {
      query += ' AND i.priority = ?';
      params.push(filter.priority);
    }
    if (filter?.categoryId) {
      query += ' AND i.category_id = ?';
      params.push(filter.categoryId);
    }
    if (filter?.locationId) {
      query += ' AND i.location_id = ?';
      params.push(filter.locationId);
    }
    if (filter?.searchQuery) {
      query += ' AND (i.title LIKE ? OR i.description LIKE ?)';
      params.push(`%${filter.searchQuery}%`, `%${filter.searchQuery}%`);
    }

    query += ' ORDER BY i.created_at DESC';

    const rows = await db.getAllAsync<Incident>(query, params);
    return rows;
  }

  // Fallback memoria
  return memoryIncidents
    .filter((inc) => {
      if (filter?.status && filter.status !== 'all' && inc.status !== filter.status) return false;
      if (filter?.priority && filter.priority !== 'all' && inc.priority !== filter.priority) return false;
      if (filter?.categoryId && inc.category_id !== filter.categoryId) return false;
      if (filter?.locationId && inc.location_id !== filter.locationId) return false;
      if (filter?.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        if (!inc.title.toLowerCase().includes(q) && !inc.description.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .map((inc) => {
      const cat = memoryCategories.find((c) => c.id === inc.category_id);
      const loc = memoryLocations.find((l) => l.id === inc.location_id);
      const rep = memoryUsers.find((u) => u.id === inc.reporter_id);
      return {
        ...inc,
        category_name: cat?.name || 'General',
        location_name: loc ? `${loc.building} - ${loc.floor} - ${loc.room}` : 'Ubicación no especificada',
        reporter_name: rep?.name || 'Usuario',
        reporter_email: rep?.email || '',
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchPotentialDuplicates(categoryId: string, locationId: string): Promise<Incident[]> {
  const db = await getDatabase();
  if (db) {
    const query = `
      SELECT i.*, 
             c.name as category_name, 
             (l.building || ' - ' || l.floor || ' - ' || l.room) as location_name
      FROM incidents i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.category_id = ? AND i.location_id = ? AND i.status != 'solucionada' AND i.status != 'no procedente'
      ORDER BY i.created_at DESC
    `;
    return await db.getAllAsync<Incident>(query, [categoryId, locationId]);
  }

  return memoryIncidents.filter(
    (inc) =>
      inc.category_id === categoryId &&
      inc.location_id === locationId &&
      inc.status !== 'solucionada' &&
      inc.status !== 'no procedente'
  );
}

export async function createIncident(data: {
  title: string;
  description: string;
  category_id: string;
  location_id: string;
  reporter_id: string;
  image_uri?: string;
  priority?: IncidentPriority;
}): Promise<Incident> {
  const id = `inc-${Date.now()}`;
  const now = new Date().toISOString();
  const priority = data.priority || 'media';
  const status: IncidentStatus = 'recibida';

  const newIncident: Incident = {
    id,
    title: data.title,
    description: data.description,
    category_id: data.category_id,
    location_id: data.location_id,
    reporter_id: data.reporter_id,
    image_uri: data.image_uri,
    status,
    priority,
    upvotes_count: 1,
    created_at: now,
    updated_at: now,
  };

  const db = await getDatabase();
  if (db) {
    await db.runAsync(
      `INSERT INTO incidents (id, title, description, category_id, location_id, reporter_id, image_uri, status, priority, upvotes_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, data.title, data.description, data.category_id, data.location_id, data.reporter_id, data.image_uri || null, status, priority, now, now]
    );

    // Auditoría inicial (RNF-013)
    await db.runAsync(
      `INSERT INTO audit_logs (id, incident_id, user_id, user_name, action, previous_state, new_state, notes, created_at)
       VALUES (?, ?, ?, ?, 'CREACIÓN', 'N/A', 'recibida', 'Incidencia registrada por el usuario.', ?)`,
      [`audit-${Date.now()}`, id, data.reporter_id, 'Usuario', now]
    );
  } else {
    memoryIncidents.unshift(newIncident);
    memoryAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      incident_id: id,
      user_id: data.reporter_id,
      user_name: 'Usuario',
      action: 'CREACIÓN',
      previous_state: 'N/A',
      new_state: 'recibida',
      notes: 'Incidencia registrada por el usuario.',
      created_at: now,
    });
  }

  return newIncident;
}

export async function updateIncidentStatus(params: {
  incidentId: string;
  newStatus: IncidentStatus;
  notes: string;
  user: User;
  priority?: IncidentPriority;
  assignedArea?: string;
  assignedUser?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDatabase();

  if (db) {
    const current = await db.getFirstAsync<Incident>('SELECT * FROM incidents WHERE id = ?', [params.incidentId]);
    const prevStatus = current?.status || 'recibida';

    await db.runAsync(
      `UPDATE incidents 
       SET status = ?, 
           priority = COALESCE(?, priority), 
           assigned_to_area = COALESCE(?, assigned_to_area), 
           assigned_to_user = COALESCE(?, assigned_to_user),
           updated_at = ?
       WHERE id = ?`,
      [
        params.newStatus,
        params.priority || null,
        params.assignedArea || null,
        params.assignedUser || null,
        now,
        params.incidentId,
      ]
    );

    // Registrar en auditoría obligatoria (RNF-013)
    await db.runAsync(
      `INSERT INTO audit_logs (id, incident_id, user_id, user_name, action, previous_state, new_state, notes, created_at)
       VALUES (?, ?, ?, ?, 'CAMBIO_ESTADO', ?, ?, ?, ?)`,
      [`audit-${Date.now()}`, params.incidentId, params.user.id, params.user.name, prevStatus, params.newStatus, params.notes, now]
    );

    // Generar notificación para el reportante (RF-006)
    if (current?.reporter_id) {
      await db.runAsync(
        `INSERT INTO notifications (id, user_id, incident_id, title, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `notif-${Date.now()}`,
          current.reporter_id,
          params.incidentId,
          `Estado actualizado: ${params.newStatus.toUpperCase()}`,
          `Tu reporte ha cambiado a "${params.newStatus}". Nota: ${params.notes}`,
          now,
        ]
      );
    }
  } else {
    const idx = memoryIncidents.findIndex((i) => i.id === params.incidentId);
    if (idx !== -1) {
      const prev = memoryIncidents[idx].status;
      memoryIncidents[idx] = {
        ...memoryIncidents[idx],
        status: params.newStatus,
        priority: params.priority || memoryIncidents[idx].priority,
        assigned_to_area: params.assignedArea || memoryIncidents[idx].assigned_to_area,
        assigned_to_user: params.assignedUser || memoryIncidents[idx].assigned_to_user,
        updated_at: now,
      };

      memoryAuditLogs.unshift({
        id: `audit-${Date.now()}`,
        incident_id: params.incidentId,
        user_id: params.user.id,
        user_name: params.user.name,
        action: 'CAMBIO_ESTADO',
        previous_state: prev,
        new_state: params.newStatus,
        notes: params.notes,
        created_at: now,
      });
    }
  }
}

export async function updateIncidentContent(params: {
  incidentId: string;
  title: string;
  description: string;
  categoryId: string;
  locationId: string;
  imageUri?: string;
  user: User;
}): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDatabase();

  if (db) {
    const current = await db.getFirstAsync<Incident>('SELECT status FROM incidents WHERE id = ?', [params.incidentId]);
    if (current && current.status !== 'recibida') {
      throw new Error('Solo se pueden editar incidencias en estado "recibida".');
    }

    await db.runAsync(
      `UPDATE incidents 
       SET title = ?, description = ?, category_id = ?, location_id = ?, image_uri = COALESCE(?, image_uri), updated_at = ?
       WHERE id = ?`,
      [params.title, params.description, params.categoryId, params.locationId, params.imageUri || null, now, params.incidentId]
    );

    await db.runAsync(
      `INSERT INTO audit_logs (id, incident_id, user_id, user_name, action, previous_state, new_state, notes, created_at)
       VALUES (?, ?, ?, ?, 'EDICIÓN', 'recibida', 'recibida', 'El usuario actualizó la información del reporte.', ?)`,
      [`audit-${Date.now()}`, params.incidentId, params.user.id, params.user.name, now]
    );
  } else {
    const idx = memoryIncidents.findIndex((i) => i.id === params.incidentId);
    if (idx !== -1) {
      if (memoryIncidents[idx].status !== 'recibida') {
        throw new Error('Solo se pueden editar incidencias en estado "recibida".');
      }
      memoryIncidents[idx] = {
        ...memoryIncidents[idx],
        title: params.title,
        description: params.description,
        category_id: params.categoryId,
        location_id: params.locationId,
        image_uri: params.imageUri || memoryIncidents[idx].image_uri,
        updated_at: now,
      };
    }
  }
}

export async function cancelIncident(incidentId: string, user: User, reason: string): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDatabase();

  if (db) {
    const current = await db.getFirstAsync<Incident>('SELECT status FROM incidents WHERE id = ?', [incidentId]);
    if (current && current.status !== 'recibida') {
      throw new Error('Solo se pueden cancelar incidencias en estado "recibida".');
    }

    await db.runAsync("UPDATE incidents SET status = 'no procedente', updated_at = ? WHERE id = ?", [now, incidentId]);

    await db.runAsync(
      `INSERT INTO audit_logs (id, incident_id, user_id, user_name, action, previous_state, new_state, notes, created_at)
       VALUES (?, ?, ?, ?, 'CANCELACIÓN_USUARIO', 'recibida', 'no procedente', ?, ?)`,
      [`audit-${Date.now()}`, incidentId, user.id, user.name, reason || 'Cancelado voluntariamente por el usuario.', now]
    );
  } else {
    const idx = memoryIncidents.findIndex((i) => i.id === incidentId);
    if (idx !== -1) {
      if (memoryIncidents[idx].status !== 'recibida') {
        throw new Error('Solo se pueden cancelar incidencias en estado "recibida".');
      }
      memoryIncidents[idx] = {
        ...memoryIncidents[idx],
        status: 'no procedente',
        updated_at: now,
      };
    }
  }
}

export async function upvoteIncident(incidentId: string, userId: string): Promise<number> {
  const now = new Date().toISOString();
  const db = await getDatabase();

  if (db) {
    try {
      await db.runAsync(
        'INSERT INTO incident_upvotes (id, incident_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [`up-${Date.now()}`, incidentId, userId, now]
      );
      await db.runAsync('UPDATE incidents SET upvotes_count = upvotes_count + 1 WHERE id = ?', [incidentId]);
    } catch {
      // Ya dio apoyo previamente
    }
    const updated = await db.getFirstAsync<{ upvotes_count: number }>('SELECT upvotes_count FROM incidents WHERE id = ?', [incidentId]);
    return updated?.upvotes_count || 0;
  }

  const existing = memoryUpvotes.find((u) => u.incident_id === incidentId && u.user_id === userId);
  if (!existing) {
    memoryUpvotes.push({ id: `up-${Date.now()}`, incident_id: incidentId, user_id: userId, created_at: now });
    const inc = memoryIncidents.find((i) => i.id === incidentId);
    if (inc) inc.upvotes_count += 1;
  }
  const inc = memoryIncidents.find((i) => i.id === incidentId);
  return inc?.upvotes_count || 0;
}

export async function addComment(incidentId: string, user: User, comment: string): Promise<IncidentComment> {
  const id = `comm-${Date.now()}`;
  const now = new Date().toISOString();
  const newComment: IncidentComment = {
    id,
    incident_id: incidentId,
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    comment,
    created_at: now,
  };

  const db = await getDatabase();
  if (db) {
    await db.runAsync(
      'INSERT INTO incident_comments (id, incident_id, user_id, user_name, user_role, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, incidentId, user.id, user.name, user.role, comment, now]
    );
  } else {
    memoryComments.push(newComment);
  }

  return newComment;
}

export async function fetchComments(incidentId: string): Promise<IncidentComment[]> {
  const db = await getDatabase();
  if (db) {
    return await db.getAllAsync<IncidentComment>(
      'SELECT * FROM incident_comments WHERE incident_id = ? ORDER BY created_at ASC',
      [incidentId]
    );
  }
  return memoryComments.filter((c) => c.incident_id === incidentId);
}

export async function fetchAuditLogs(incidentId: string): Promise<AuditLog[]> {
  const db = await getDatabase();
  if (db) {
    return await db.getAllAsync<AuditLog>(
      'SELECT * FROM audit_logs WHERE incident_id = ? ORDER BY created_at DESC',
      [incidentId]
    );
  }
  return memoryAuditLogs.filter((a) => a.incident_id === incidentId);
}

// ==========================================
// MÉTODOS DE CATÁLOGOS Y ADMINISTRACIÓN
// ==========================================

export async function fetchCategories(onlyActive = true): Promise<Category[]> {
  const db = await getDatabase();
  if (db) {
    const query = onlyActive ? 'SELECT * FROM categories WHERE is_active = 1 ORDER BY name ASC' : 'SELECT * FROM categories ORDER BY name ASC';
    return await db.getAllAsync<Category>(query);
  }
  return memoryCategories.filter((c) => (onlyActive ? c.is_active === 1 : true));
}

export async function saveCategory(category: { name: string; icon: string; description: string }): Promise<Category> {
  const id = `cat-${Date.now()}`;
  const newCat: Category = { id, ...category, is_active: 1 };
  const db = await getDatabase();
  if (db) {
    await db.runAsync('INSERT INTO categories (id, name, icon, description, is_active) VALUES (?, ?, ?, ?, 1)', [
      id,
      category.name,
      category.icon,
      category.description,
    ]);
  } else {
    memoryCategories.push(newCat);
  }
  return newCat;
}

export async function toggleCategoryStatus(id: string, isActive: number): Promise<void> {
  const db = await getDatabase();
  if (db) {
    await db.runAsync('UPDATE categories SET is_active = ? WHERE id = ?', [isActive, id]);
  } else {
    const c = memoryCategories.find((cat) => cat.id === id);
    if (c) c.is_active = isActive;
  }
}

export async function fetchLocations(onlyActive = true): Promise<Location[]> {
  const db = await getDatabase();
  if (db) {
    const query = onlyActive
      ? 'SELECT * FROM locations WHERE is_active = 1 ORDER BY building ASC, floor ASC, room ASC'
      : 'SELECT * FROM locations ORDER BY building ASC, floor ASC, room ASC';
    return await db.getAllAsync<Location>(query);
  }
  return memoryLocations.filter((l) => (onlyActive ? l.is_active === 1 : true));
}

export async function saveLocation(loc: { building: string; floor: string; room: string }): Promise<Location> {
  const id = `loc-${Date.now()}`;
  const newLoc: Location = { id, ...loc, is_active: 1 };
  const db = await getDatabase();
  if (db) {
    await db.runAsync('INSERT INTO locations (id, building, floor, room, is_active) VALUES (?, ?, ?, ?, 1)', [
      id,
      loc.building,
      loc.floor,
      loc.room,
    ]);
  } else {
    memoryLocations.push(newLoc);
  }
  return newLoc;
}

export async function toggleLocationStatus(id: string, isActive: number): Promise<void> {
  const db = await getDatabase();
  if (db) {
    await db.runAsync('UPDATE locations SET is_active = ? WHERE id = ?', [isActive, id]);
  } else {
    const l = memoryLocations.find((loc) => loc.id === id);
    if (l) l.is_active = isActive;
  }
}

export async function fetchUsers(): Promise<User[]> {
  const db = await getDatabase();
  if (db) {
    return await db.getAllAsync<User>('SELECT * FROM users ORDER BY name ASC');
  }
  return memoryUsers;
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const db = await getDatabase();
  if (db) {
    await db.runAsync('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);
  } else {
    const u = memoryUsers.find((user) => user.id === userId);
    if (u) u.role = newRole;
  }
}

