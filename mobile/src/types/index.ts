export type UserRole = 'usuario' | 'directivo' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  is_active: number; // 1 = active, 0 = inactive
}

export interface Location {
  id: string;
  building: string;
  floor: string;
  room: string;
  is_active: number; // 1 = active, 0 = inactive
}

export type IncidentStatus = 'recibida' | 'en proceso' | 'solucionada' | 'no procedente';
export type IncidentPriority = 'alta' | 'media' | 'baja';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  location_id: string;
  location_name?: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_email?: string;
  image_uri?: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  assigned_to_area?: string; // e.g., Mantenimiento, Sistemas, Limpieza
  assigned_to_user?: string;
  upvotes_count: number;
  created_at: string;
  updated_at: string;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  comment: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  incident_id: string;
  user_id: string;
  user_name: string;
  action: string;
  previous_state: string;
  new_state: string;
  notes: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  incident_id: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface IncidentFilter {
  searchQuery?: string;
  categoryId?: string;
  locationId?: string;
  status?: IncidentStatus | 'all';
  priority?: IncidentPriority | 'all';
  dateFrom?: string;
  dateTo?: string;
}

