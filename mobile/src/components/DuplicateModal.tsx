import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Incident } from '../types';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';

interface Props {
  visible: boolean;
  duplicates: Incident[];
  onSupportExisting: (incidentId: string) => void;
  onProceedAnyway: () => void;
  onCancel: () => void;
}

export const DuplicateModal: React.FC<Props> = ({
  visible,
  duplicates,
  onSupportExisting,
  onProceedAnyway,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="alert-decagram" size={26} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Posible Incidencia Duplicada</Text>
              <Text style={styles.subtitle}>
                Encontramos {duplicates.length} reporte(s) abierto(s) en la misma ubicación y categoría:
              </Text>
            </View>
          </View>

          <ScrollView style={styles.listContainer}>
            {duplicates.map((item) => (
              <View key={item.id} style={styles.duplicateItem}>
                <View style={styles.dupHeader}>
                  <StatusBadge status={item.status} size="small" />
                  <Text style={styles.dupDate}>
                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>

                <Text style={styles.dupTitle}>{item.title}</Text>
                <Text style={styles.dupDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={() => onSupportExisting(item.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="thumb-up" size={16} color="#FFFFFF" />
                  <Text style={styles.supportButtonText}>
                    Apoyar este reporte ({item.upvotes_count || 1} apoyos)
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.proceedButton} onPress={onProceedAnyway} activeOpacity={0.8}>
              <Text style={styles.proceedText}>Registrar como incidencia distinta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Volver a editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    maxHeight: 280,
    marginBottom: 16,
  },
  duplicateItem: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  dupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dupDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  dupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dupDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    gap: 8,
  },
  proceedButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

