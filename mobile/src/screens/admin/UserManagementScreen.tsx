import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { User, UserRole } from '../../types';
import { fetchUsers, updateUserRole } from '../../database/database';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const UserManagementScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal para cambiar rol
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      const all = await fetchUsers();
      setUsers(all);
    } catch (err) {
      console.warn('Error cargando usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const handleChangeRole = async (targetUser: User, newRole: UserRole) => {
    if (targetUser.id === currentUser?.id && newRole !== 'admin') {
      Alert.alert(
        'Acción Restringida',
        'No puedes removerte tus propios privilegios de Administrador mientras tienes la sesión activa.'
      );
      return;
    }

    try {
      await updateUserRole(targetUser.id, newRole);
      setSelectedUser(null);
      await loadAllUsers();
      Alert.alert('Rol Actualizado', `El usuario ${targetUser.name} ahora tiene el rol "${newRole.toUpperCase()}".`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { bg: '#E0F2FE', text: '#0369A1', label: 'Administrador' };
      case 'directivo':
        return { bg: '#EDE9FE', text: '#6D28D9', label: 'Directivo Autorizado' };
      default:
        return { bg: '#DCFCE7', text: '#15803D', label: 'Estudiante / Personal' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Administración de Cuentas y Roles (RF-014)</Text>
        <Text style={styles.subtitle}>
          Control de acceso y permisos institucionales en Spot&Fix.
        </Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={loadAllUsers}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const badge = getRoleBadge(item.role);
          return (
            <View style={styles.userCard}>
              <View style={styles.cardHeader}>
                <View style={styles.userAvatar}>
                  <MaterialCommunityIcons
                    name={item.role === 'admin' ? 'cog' : item.role === 'directivo' ? 'shield-account' : 'account'}
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  {item.department ? <Text style={styles.userDept}>Área: {item.department}</Text> : null}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.rolePill, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.rolePillText, { color: badge.text }]}>{badge.label}</Text>
                </View>

                <TouchableOpacity
                  style={styles.changeRoleBtn}
                  onPress={() => setSelectedUser(item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="account-cog" size={16} color={colors.primary} />
                  <Text style={styles.changeRoleBtnText}>Cambiar Rol</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Modal para Asignar o Retirar Rol (RF-014) */}
      <Modal visible={!!selectedUser} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Asignar Rol Institucional</Text>
            <Text style={styles.modalSub}>
              Usuario: <Text style={{ fontWeight: '700', color: colors.text }}>{selectedUser?.name}</Text>
            </Text>

            <TouchableOpacity
              style={[styles.roleOption, selectedUser?.role === 'usuario' && styles.roleOptionActive]}
              onPress={() => selectedUser && handleChangeRole(selectedUser, 'usuario')}
            >
              <MaterialCommunityIcons name="account" size={24} color="#059669" />
              <View style={{ flex: 1 }}>
                <Text style={styles.roleOptTitle}>Usuario (Estudiante / Personal)</Text>
                <Text style={styles.roleOptDesc}>Puede registrar incidencias y dar seguimiento a sus reportes.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, selectedUser?.role === 'directivo' && styles.roleOptionActive]}
              onPress={() => selectedUser && handleChangeRole(selectedUser, 'directivo')}
            >
              <MaterialCommunityIcons name="shield-account" size={24} color="#7C3AED" />
              <View style={{ flex: 1 }}>
                <Text style={styles.roleOptTitle}>Directivo Autorizado</Text>
                <Text style={styles.roleOptDesc}>Supervisa reportes, asigna prioridades, estados y responsables.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, selectedUser?.role === 'admin' && styles.roleOptionActive]}
              onPress={() => selectedUser && handleChangeRole(selectedUser, 'admin')}
            >
              <MaterialCommunityIcons name="cog" size={24} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={styles.roleOptTitle}>Administrador de Plataforma</Text>
                <Text style={styles.roleOptDesc}>Acceso total: gestión de catálogos maestros y roles de usuario.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedUser(null)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
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
  headerBox: {
    backgroundColor: colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userDept: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  changeRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeRoleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: 4,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 10,
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#F8FAFC',
  },
  roleOptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  roleOptDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

