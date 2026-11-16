import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { Incident, IncidentStatus } from '../../types';
import { IncidentCard } from '../../components/IncidentCard';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBadge } from '../../components/StatusBadge';

interface Props {
  onSelectIncident: (incident: Incident) => void;
  onCreateNew: () => void;
}

export const UserReportsScreen: React.FC<Props> = ({ onSelectIncident, onCreateNew }) => {
  const { currentUser } = useAuth();
  const { incidents, isLoading, refreshIncidents, editIncident, cancelIncident, upvote } = useIncidents();

  // Filtrar solo las creadas por el usuario autenticado (RF-005)
  const myIncidents = incidents.filter((i) => i.reporter_id === currentUser?.id);

  const [activeTab, setActiveTab] = useState<'all' | IncidentStatus>('all');
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const filteredIncidents = myIncidents.filter((i) => {
    if (activeTab === 'all') return true;
    return i.status === activeTab;
  });

  const handleOpenEdit = (inc: Incident) => {
    if (inc.status !== 'recibida') {
      Alert.alert(
        'Modificación Bloqueada (RF-012)',
        `Este reporte ya se encuentra en estado "${inc.status.toUpperCase()}". Por políticas institucionales, solo puede ser editado mientras esté en "Recibida".`
      );
      return;
    }
    setEditingIncident(inc);
    setEditTitle(inc.title);
    setEditDesc(inc.description);
  };

  const handleSaveEdit = async () => {
    if (!editingIncident) return;
    if (editTitle.trim().length < 5 || editDesc.trim().length < 10) {
      Alert.alert('Datos insuficientes', 'El título y descripción deben ser claros y detallados.');
      return;
    }

    try {
      setIsSavingEdit(true);
      await editIncident(
        editingIncident.id,
        editTitle.trim(),
        editDesc.trim(),
        editingIncident.category_id,
        editingIncident.location_id,
        editingIncident.image_uri
      );
      setEditingIncident(null);
      Alert.alert('¡Actualizado!', 'El reporte ha sido modificado exitosamente.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelReport = (inc: Incident) => {
    if (inc.status !== 'recibida') {
      Alert.alert(
        'Cancelación Bloqueada (RF-012)',
        `No es posible cancelar este reporte porque ya se encuentra en "${inc.status.toUpperCase()}".`
      );
      return;
    }

    Alert.alert(
      'Cancelar Reporte de Incidencia',
      '¿Estás seguro de cancelar este reporte? Pasará al estado "No procedente" y el personal ya no lo atenderá.',
      [
        { text: 'No, conservar', style: 'cancel' },
        {
          text: 'Sí, cancelar reporte',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelIncident(inc.id, 'Cancelado voluntariamente por el usuario reportante.');
              Alert.alert('Reporte Cancelado', 'El estado del reporte ha cambiado a "No procedente".');
            } catch (err: any) {
              Alert.alert('Error al cancelar', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Pestañas de estado rápido */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Todos ({myIncidents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'recibida' && styles.tabBtnActive]}
          onPress={() => setActiveTab('recibida')}
        >
          <Text style={[styles.tabText, activeTab === 'recibida' && styles.tabTextActive]}>
            Recibidos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'en proceso' && styles.tabBtnActive]}
          onPress={() => setActiveTab('en proceso')}
        >
          <Text style={[styles.tabText, activeTab === 'en proceso' && styles.tabTextActive]}>
            En Proceso
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'solucionada' && styles.tabBtnActive]}
          onPress={() => setActiveTab('solucionada')}
        >
          <Text style={[styles.tabText, activeTab === 'solucionada' && styles.tabTextActive]}>
            Solucionados
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIncidents} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <IncidentCard
              incident={item}
              onPress={() => onSelectIncident(item)}
              onUpvote={() => upvote(item.id)}
            />

            {/* Acciones de Edición y Cancelación para RF-012 */}
            {item.status === 'recibida' && (
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnEdit}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
                  <Text style={styles.actionBtnEditText}>Editar contenido</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnCancel}
                  onPress={() => handleCancelReport(item)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.actionBtnCancelText}>Cancelar reporte</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-search-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No tienes incidencias registradas</Text>
            <Text style={styles.emptySubtitle}>
              Si observas una falla en aulas, muebles o equipos, crea tu primer reporte.
            </Text>
            <TouchableOpacity style={styles.createFirstBtn} onPress={onCreateNew} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.createFirstBtnText}>Reportar Nuevo Problema</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Botón flotante para reportar (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={onCreateNew} activeOpacity={0.85}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal para Editar Incidencia en 'recibida' (RF-012) */}
      <Modal visible={!!editingIncident} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Reporte</Text>
              <TouchableOpacity onPress={() => setEditingIncident(null)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              Puedes corregir el título y descripción mientras el estado siga en "Recibida".
            </Text>

            <Text style={styles.fieldLabel}>Título</Text>
            <TextInput
              style={styles.fieldInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título descriptivo"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Descripción Detallada</Text>
            <TextInput
              style={[styles.fieldInput, { minHeight: 90 }]}
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
              textAlignVertical="top"
              placeholder="Detalles del problema..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnSecondaryModal}
                onPress={() => setEditingIncident(null)}
              >
                <Text style={styles.btnSecondaryModalText}>Descartar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPrimaryModal}
                onPress={handleSaveEdit}
                disabled={isSavingEdit}
              >
                <Text style={styles.btnPrimaryModalText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  itemWrapper: {
    marginBottom: 6,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: -4,
    marginBottom: 12,
    paddingRight: 6,
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  actionBtnCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnCancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  createFirstBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  btnSecondaryModal: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSecondaryModalText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  btnPrimaryModal: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

