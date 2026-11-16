import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, availableUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMsg('Por favor ingresa tu correo institucional.');
      return;
    }
    setErrorMsg('');
    const success = await login(email);
    if (!success) {
      setErrorMsg('Correo o credenciales no válidas. Prueba con los accesos directos abajo.');
    }
  };

  const handleQuickLogin = async (userEmail: string, role: UserRole) => {
    setEmail(userEmail);
    setPassword('••••••••');
    await login(userEmail, role);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroSection}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="tools" size={42} color={colors.primary} />
        </View>
        <Text style={styles.brandTitle}>Spot&Fix</Text>
        <Text style={styles.brandSubtitle}>
          Plataforma Institucional de Reporte y Gestión de Incidencias
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar Sesión</Text>
        <Text style={styles.cardSubtitle}>
          Ingresa con tu correo institucional registrado
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Correo Institucional</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder="ejemplo@institucion.edu"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                setErrorMsg('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.loginButtonText}>Ingresar a Spot&Fix</Text>
        </TouchableOpacity>
      </View>

      {/* Accesos rápidos preconfigurados por rol */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>Cuentas Demo para Pruebas Rápidas:</Text>
        <Text style={styles.demoSubtitle}>
          Toca una cuenta para ingresar instantáneamente con su rol:
        </Text>

        {availableUsers.map((u) => {
          let roleColor = '#059669';
          let roleName = 'Usuario';
          let iconName: any = 'school';

          if (u.role === 'directivo') {
            roleColor = '#7C3AED';
            roleName = 'Directivo Autorizado';
            iconName = 'shield-account';
          } else if (u.role === 'admin') {
            roleColor = '#0284C7';
            roleName = 'Administrador TI';
            iconName = 'cog';
          }

          return (
            <TouchableOpacity
              key={u.id}
              style={styles.quickUserCard}
              onPress={() => handleQuickLogin(u.email, u.role)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickAvatar, { backgroundColor: roleColor + '20' }]}>
                <MaterialCommunityIcons name={iconName} size={22} color={roleColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickUserName}>{u.name}</Text>
                <Text style={styles.quickUserEmail}>{u.email}</Text>
                <View style={[styles.quickRoleBadge, { backgroundColor: roleColor }]}>
                  <Text style={styles.quickRoleText}>{roleName}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '85%',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  quickUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
    gap: 12,
  },
  quickAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  quickUserEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickRoleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  quickRoleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

