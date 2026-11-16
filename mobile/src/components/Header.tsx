import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  title?: string;
}

export const Header: React.FC<Props> = ({ title }) => {
  const { currentUser, role, availableUsers, switchUser, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'directivo':
        return '#7C3AED';
      case 'admin':
        return '#0284C7';
      default:
        return '#059669';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'directivo':
        return 'Directivo Autorizado';
      case 'admin':
        return 'Administrador';
      default:
        return 'Estudiante / Personal';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <MaterialCommunityIcons name="tools" size={24} color={colors.textLight} />
          <Text style={styles.brandTitle}>Spot&Fix</Text>
        </View>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="account-switch" size={18} color="#FFFFFF" />
          <Text style={styles.switchText}>Cambiar Rol</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {currentUser?.name || 'Invitado'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() }]}>
            <Text style={styles.roleText}>{getRoleLabel()}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      {title && <Text style={styles.screenTitle}>{title}</Text>}

      {/* Modal de selección rápida de rol */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Perfil Institucional</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Selecciona una cuenta para probar los permisos de cada rol:
            </Text>

            {availableUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userItem,
                  currentUser?.id === user.id && styles.userItemActive,
                ]}
                onPress={() => {
                  switchUser(user.id);
                  setModalVisible(false);
                }}
              >
                <View style={styles.avatarCircle}>
                  <MaterialCommunityIcons
                    name={user.role === 'directivo' ? 'shield-account' : user.role === 'admin' ? 'cog' : 'account'}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemUserName}>{user.name}</Text>
                  <Text style={styles.itemUserEmail}>{user.email}</Text>
                  <Text style={styles.itemUserRole}>Rol: {user.role.toUpperCase()}</Text>
                </View>
                {currentUser?.id === user.id && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.secondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  switchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  userName: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '55%',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    padding: 6,
  },
  screenTitle: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  userItemActive: {
    borderColor: colors.secondary,
    backgroundColor: '#F0F9FF',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemUserEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemUserRole: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
});

