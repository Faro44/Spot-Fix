export const colors = {
  primary: '#1E3A8A', // Azul institucional profundo
  primaryDark: '#172554',
  primaryLight: '#3B82F6',
  secondary: '#0284C7',
  accent: '#F59E0B',
  
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  surface: '#F1F5F9',
  
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#FFFFFF',

  // Status colors
  statusReceived: '#6366F1', // Indigo para "recibida"
  statusInProcess: '#D97706', // Amber para "en proceso"
  statusSolved: '#16A34A', // Verde para "solucionada"
  statusRejected: '#DC2626', // Rojo para "no procedente"

  // Priority colors
  priorityHigh: '#DC2626',
  priorityMedium: '#D97706',
  priorityLow: '#2563EB',

  border: '#E2E8F0',
  divider: '#F1F5F9',
  shadow: '#64748B',
};

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  recibida: { bg: '#EEF2FF', text: '#4338CA', label: 'Recibida' },
  'en proceso': { bg: '#FEF3C7', text: '#B45309', label: 'En Proceso' },
  solucionada: { bg: '#DCFCE7', text: '#15803D', label: 'Solucionada' },
  'no procedente': { bg: '#FEE2E2', text: '#B91C1C', label: 'No Procedente' },
};

export const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
  alta: { bg: '#FEE2E2', text: '#B91C1C', label: 'Alta' },
  media: { bg: '#FEF3C7', text: '#B45309', label: 'Media' },
  baja: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Baja' },
};

