import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Incident, IncidentStatus, IncidentPriority, AuditLog, IncidentComment } from '../../types';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  incident: Incident;
  onBack: () => void;
}

export const IncidentDetailScreen: React.FC<Props> = ({ incident, onBack }) => {
  const { role } = useAuth();
  const { updateStatus, addComment, getComments, getAuditLogs, upvote } = useIncidents();

  const isDirectorOrAdmin = role === 'directivo' || role === 'admin';

  // Datos reactivos
  const [comments, setComments] = useState<IncidentComment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Modal de actualización de estado (RF-003, RF-007, RF-008, RNF-013)
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident.status);
  const [selectedPriority, setSelectedPriority] = useState<IncidentPriority>(incident.priority);
  const [assignedArea, setAssignedArea] = useState(incident.assigned_to_area || '');
  const [assignedUser, setAssignedUser] = useState(incident.assigned_to_user || '');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Cargar comentarios y logs de auditoría
  const loadCommentsAndAudit = async () => {
    try {
      const [comms, logs] = await Promise.all([getComments(incident.id), getAuditLogs(incident.id)]);
      setComments(comms);
      setAuditLogs(logs);
    } catch (err) {
      console.warn('Error cargando bitácora:', err);
    }
  };

  useEffect(() => {
    loadCommentsAndAudit();
  }, [incident.id]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsPostingComment(true);
      await addComment(incident.id, newComment.trim());
      setNewComment('');
      await loadCommentsAndAudit();
    } catch (err: any) {
      Alert.alert('Error al comentar', err.message);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleSaveStatusTransition = async () => {
    if (!statusNotes.trim()) {
      Alert.alert(
        'Observaciones Obligatorias (RF-003)',
        'Debes ingresar una nota u observación que justifique el cambio de estado para la auditoría.'
      );
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await updateStatus(
        incident.id,
        selectedStatus,
        statusNotes.trim(),
        selectedPriority,
        assignedArea.trim(),
        assignedUser.trim()
      );
      setShowStatusModal(false);
      setStatusNotes('');
      await loadCommentsAndAudit();
      Alert.alert('Estado Actualizado', `La incidencia ha pasado a "${selectedStatus.toUpperCase()}".`);
    } catch (err: any) {
      Alert.alert('Error al actualizar', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra superior de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.upvoteHeaderBtn}
          onPress={() => upvote(incident.id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="thumb-up" size={16} color={colors.secondary} />
          <Text style={styles.upvoteHeaderText}>{incident.upvotes_count || 1} apoyos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Cabecera con Categoría y Estado */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="tag" size={14} color={colors.primary} />
            <Text style={styles.categoryBadgeText}>{incident.category_name || 'General'}</Text>
          </View>
          <StatusBadge status={incident.status} />
        </View>

        <Text style={styles.titleText}>{incident.title}</Text>

        <View style={styles.metaRow}>
          <PriorityBadge priority={incident.priority} />
          <Text style={styles.metaDate}>
            Reportado: {new Date(incident.created_at).toLocaleDateString('es-ES')} a las{' '}
            {new Date(incident.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Ubicación institucional */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Ubicación Física</Text>
              <Text style={styles.infoValue}>{incident.location_name || 'Ubicación no especificada'}</Text>
            </View>
          </View>
        </View>

        {/* Datos del Reportante (Protegidos por rol según RNF-007) */}
        {isDirectorOrAdmin && (
          <View style={[styles.infoCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-circle-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Datos del Reportante (Vista Directiva)</Text>
                <Text style={styles.infoValue}>{incident.reporter_name || 'Usuario institucional'}</Text>
                <Text style={styles.infoSubvalue}>{incident.reporter_email || 'Sin correo registrado'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Responsable o Área asignada (RF-008) */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-hard-hat" size={20} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Área y Responsable de Solución</Text>
              <Text style={styles.infoValue}>
                {incident.assigned_to_area || 'Pendiente de asignación por directivo'}
              </Text>
              {incident.assigned_to_user ? (
                <Text style={styles.infoSubvalue}>Técnico asignado: {incident.assigned_to_user}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Descripción del problema */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Descripción del Problema</Text>
          <Text style={styles.descriptionText}>{incident.description}</Text>
        </View>

        {/* Fotografía de evidencia */}
        {incident.image_uri && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Evidencia Fotográfica Adjunta</Text>
            <Image source={{ uri: incident.image_uri }} style={styles.fullImage} />
          </View>
        )}

        {/* Botón para actualizar estado (Solo Directivo o Admin) */}
        {isDirectorOrAdmin && (
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => setShowStatusModal(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="tune" size={20} color="#FFFFFF" />
            <Text style={styles.manageBtnText}>Gestionar Estado, Prioridad y Asignación</Text>
          </TouchableOpacity>
        )}

        {/* Comentarios y Notas de Seguimiento (RF-010) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Notas y Comentarios de Seguimiento ({comments.length})</Text>

          {comments.map((comm) => (
            <View key={comm.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comm.user_name}</Text>
                <View
                  style={[
                    styles.rolePill,
                    { backgroundColor: comm.user_role === 'directivo' ? '#EDE9FE' : '#F1F5F9' },
                  ]}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      { color: comm.user_role === 'directivo' ? '#6D28D9' : colors.textSecondary },
                    ]}
                  >
                    {comm.user_role.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.commentBody}>{comm.comment}</Text>
              <Text style={styles.commentDate}>
                {new Date(comm.created_at).toLocaleDateString('es-ES')} -{' '}
                {new Date(comm.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}

          {/* Formulario para agregar nuevo comentario */}
          <View style={styles.newCommentBox}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe una observación de avance..."
              placeholderTextColor={colors.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={styles.postCommentBtn}
              onPress={handlePostComment}
              disabled={isPostingComment || !newComment.trim()}
            >
              <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Historial de Auditoría y Trazabilidad (RNF-013) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Historial de Auditoría y Cambios (RNF-013)</Text>
          <View style={styles.auditTimeline}>
            {auditLogs.map((log, index) => (
              <View key={log.id} style={styles.auditItem}>
                <View style={styles.auditDot} />
                {index < auditLogs.length - 1 && <View style={styles.auditLine} />}
                <View style={styles.auditContent}>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditAction}>{log.action}</Text>
                    <Text style={styles.auditTime}>
                      {new Date(log.created_at).toLocaleDateString('es-ES')}{' '}
                      {new Date(log.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.auditUser}>Por: {log.user_name}</Text>
                  <Text style={styles.auditTransition}>
                    {log.previous_state} → {log.new_state}
                  </Text>
                  {log.notes ? <Text style={styles.auditNotes}>"{log.notes}"</Text> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Gestión de Estados y Asignación (RF-003, RF-007, RF-008) */}
      <Modal visible={showStatusModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Actualizar Estado y Asignación</Text>
                <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Selector de Estado */}
              <Text style={styles.sheetSectionTitle}>Nuevo Estado de la Incidencia *</Text>
              <View style={styles.statusChipsGrid}>
                {[
                  { id: 'recibida', label: 'Recibida', color: '#6366F1' },
                  { id: 'en proceso', label: 'En Proceso', color: '#D97706' },
                  { id: 'solucionada', label: 'Solucionada', color: '#16A34A' },
                  { id: 'no procedente', label: 'No Procedente', color: '#DC2626' },
                ].map((st) => {
                  const isSelected = selectedStatus === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        styles.statusChip,
                        isSelected && { backgroundColor: st.color, borderColor: st.color },
                      ]}
                      onPress={() => setSelectedStatus(st.id as IncidentStatus)}
                    >
                      <Text style={[styles.statusChipText, isSelected && { color: '#FFFFFF' }]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selector de Prioridad (RF-007) */}
              <Text style={[styles.sheetSectionTitle, { marginTop: 14 }]}>Nivel de Prioridad *</Text>
              <View style={styles.statusChipsGrid}>
                {[
                  { id: 'alta', label: 'Alta Prioridad' },
                  { id: 'media', label: 'Media' },
                  { id: 'baja', label: 'Baja' },
                ].map((pr) => {
                  const isSelected = selectedPriority === pr.id;
                  return (
                    <TouchableOpacity
                      key={pr.id}
                      style={[styles.statusChip, isSelected && styles.priorityChipSelected]}
                      onPress={() => setSelectedPriority(pr.id as IncidentPriority)}
                    >
                      <Text style={[styles.statusChipText, isSelected && { color: '#FFFFFF' }]}>
                        {pr.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Asignación de Área (RF-008) */}
              <Text style={[styles.sheetSectionTitle, { marginTop: 14 }]}>Área Responsable (RF-008)</Text>
              <TextInput
                style={styles.sheetInput}
                placeholder="Ej: Mantenimiento, Sistemas, Electricidad, Limpieza"
                value={assignedArea}
                onChangeText={setAssignedArea}
              />

              {/* Técnico asignado */}
              <Text style={[styles.sheetSectionTitle, { marginTop: 14 }]}>Técnico o Persona Asignada</Text>
              <TextInput
                style={styles.sheetInput}
                placeholder="Ej: Raúl Gómez / Juan Pérez"
                value={assignedUser}
                onChangeText={setAssignedUser}
              />

              {/* Observaciones obligatorias para auditoría (RF-003 / RNF-013) */}
              <Text style={[styles.sheetSectionTitle, { marginTop: 14 }]}>
                Observaciones y Motivo del Cambio *
              </Text>
              <TextInput
                style={[styles.sheetInput, { minHeight: 70 }]}
                placeholder="Detalla qué acciones se tomaron o el motivo del cambio..."
                value={statusNotes}
                onChangeText={setStatusNotes}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.sheetActionsRow}>
                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  onPress={() => setShowStatusModal(false)}
                >
                  <Text style={styles.sheetCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetSaveBtn}
                  onPress={handleSaveStatusTransition}
                  disabled={isUpdatingStatus}
                >
                  <Text style={styles.sheetSaveText}>Guardar y Notificar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  upvoteHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  upvoteHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  metaDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  infoSubvalue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionBlock: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  fullImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    elevation: 3,
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  commentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  commentBody: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
  },
  commentDate: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  newCommentBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    maxHeight: 80,
  },
  postCommentBtn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  auditTimeline: {
    marginTop: 6,
  },
  auditItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: 14,
  },
  auditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: 10,
  },
  auditLine: {
    position: 'absolute',
    top: 14,
    left: 4.5,
    width: 1.5,
    bottom: 0,
    backgroundColor: colors.border,
  },
  auditContent: {
    flex: 1,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditAction: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  auditTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  auditUser: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  auditTransition: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
  },
  auditNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sheetSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  statusChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8FAFC',
  },
  priorityChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    backgroundColor: '#FAFAFA',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  sheetSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  sheetSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

