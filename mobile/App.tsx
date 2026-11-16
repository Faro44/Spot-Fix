import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { IncidentProvider } from './src/context/IncidentContext';
import { Header } from './src/components/Header';
import { colors } from './src/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Incident } from './src/types';

// Pantallas
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { UserReportsScreen } from './src/screens/user/UserReportsScreen';
import { CreateReportScreen } from './src/screens/user/CreateReportScreen';
import { ExploreIncidentsScreen } from './src/screens/user/ExploreIncidentsScreen';
import { DirectorInboxScreen } from './src/screens/director/DirectorInboxScreen';
import { IncidentDetailScreen } from './src/screens/director/IncidentDetailScreen';
import { StatisticsScreen } from './src/screens/director/StatisticsScreen';
import { CatalogManagementScreen } from './src/screens/admin/CatalogManagementScreen';
import { UserManagementScreen } from './src/screens/admin/UserManagementScreen';

function MainNavigator() {
  const { isAuthenticated, role } = useAuth();

  // Estados de navegación
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  // Si hay una incidencia seleccionada, mostramos el detalle (RF-002, RF-003)
  if (selectedIncident) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <Header />
        <IncidentDetailScreen
          incident={selectedIncident}
          onBack={() => setSelectedIncident(null)}
        />
      </SafeAreaView>
    );
  }

  // Título según la pestaña activa
  const getTabTitle = () => {
    switch (activeTab) {
      case 'home':
        return role === 'usuario' ? 'Mis Reportes de Incidencias' : 'Bandeja de Supervisión';
      case 'create':
        return 'Nuevo Reporte de Incidencia';
      case 'explore':
        return 'Explorar Incidencias Institucionales';
      case 'stats':
        return 'Métricas y Estadísticas (RF-015)';
      case 'catalogs':
        return 'Gestión de Catálogos (RF-013)';
      case 'users':
        return 'Control de Usuarios y Roles (RF-014)';
      default:
        return 'Spot&Fix';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Header title={getTabTitle()} />

      <View style={styles.screenContent}>
        {/* Vistas según Rol y Pestaña Activa */}
        {role === 'usuario' && (
          <>
            {activeTab === 'home' && (
              <UserReportsScreen
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onCreateNew={() => setActiveTab('create')}
              />
            )}
            {activeTab === 'create' && (
              <CreateReportScreen
                onSuccess={() => setActiveTab('home')}
                onCancel={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'explore' && (
              <ExploreIncidentsScreen onSelectIncident={(inc) => setSelectedIncident(inc)} />
            )}
          </>
        )}

        {role === 'directivo' && (
          <>
            {activeTab === 'home' && (
              <DirectorInboxScreen onSelectIncident={(inc) => setSelectedIncident(inc)} />
            )}
            {activeTab === 'explore' && (
              <ExploreIncidentsScreen onSelectIncident={(inc) => setSelectedIncident(inc)} />
            )}
            {activeTab === 'stats' && <StatisticsScreen />}
          </>
        )}

        {role === 'admin' && (
          <>
            {activeTab === 'home' && (
              <DirectorInboxScreen onSelectIncident={(inc) => setSelectedIncident(inc)} />
            )}
            {activeTab === 'catalogs' && <CatalogManagementScreen />}
            {activeTab === 'users' && <UserManagementScreen />}
            {activeTab === 'stats' && <StatisticsScreen />}
          </>
        )}
      </View>

      {/* Barra de Navegación Inferior (Tabs) */}
      <View style={styles.bottomNav}>
        {role === 'usuario' && (
          <>
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={24}
                color={activeTab === 'home' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
                Mis Reportes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('create')}
              activeOpacity={0.8}
            >
              <View style={styles.createTabCircle}>
                <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
              </View>
              <Text style={[styles.navText, activeTab === 'create' && styles.navTextActive]}>
                Reportar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('explore')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="compass-outline"
                size={24}
                color={activeTab === 'explore' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'explore' && styles.navTextActive]}>
                Explorar
              </Text>
            </TouchableOpacity>
          </>
        )}

        {role === 'directivo' && (
          <>
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="inbox-arrow-down"
                size={24}
                color={activeTab === 'home' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
                Bandeja
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('explore')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={24}
                color={activeTab === 'explore' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'explore' && styles.navTextActive]}>
                Consultar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('stats')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={24}
                color={activeTab === 'stats' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'stats' && styles.navTextActive]}>
                Estadísticas
              </Text>
            </TouchableOpacity>
          </>
        )}

        {role === 'admin' && (
          <>
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="inbox"
                size={22}
                color={activeTab === 'home' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
                Incidencias
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('catalogs')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="shape-outline"
                size={22}
                color={activeTab === 'catalogs' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'catalogs' && styles.navTextActive]}>
                Catálogos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('users')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={22}
                color={activeTab === 'users' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'users' && styles.navTextActive]}>
                Usuarios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('stats')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={22}
                color={activeTab === 'stats' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.navText, activeTab === 'stats' && styles.navTextActive]}>
                Reportes
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IncidentProvider>
        <MainNavigator />
      </IncidentProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  screenContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  createTabCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
