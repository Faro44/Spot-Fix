import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { Category, Location } from '../../types';
import {
  fetchCategories,
  saveCategory,
  toggleCategoryStatus,
  fetchLocations,
  saveLocation,
  toggleLocationStatus,
} from '../../database/database';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIncidents } from '../../context/IncidentContext';

export const CatalogManagementScreen: React.FC = () => {
  const { refreshIncidents } = useIncidents();
  const [activeTab, setActiveTab] = useState<'categories' | 'locations'>('categories');

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Modales de creación
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [showLocModal, setShowLocModal] = useState(false);
  const [locBuilding, setLocBuilding] = useState('');
  const [locFloor, setLocFloor] = useState('');
  const [locRoom, setLocRoom] = useState('');

  const loadCatalogs = async () => {
    try {
      const [cats, locs] = await Promise.all([fetchCategories(false), fetchLocations(false)]);
      setCategories(cats);
      setLocations(locs);
    } catch (err) {
      console.warn('Error cargando catálogos:', err);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de la categoría.');
      return;
    }
    await saveCategory({
      name: catName.trim(),
      icon: 'tag',
      description: catDesc.trim(),
    });
    setCatName('');
    setCatDesc('');
    setShowCatModal(false);
    await loadCatalogs();
    await refreshIncidents();
  };

  const handleToggleCat = async (cat: Category) => {
    const newStatus = cat.is_active === 1 ? 0 : 1;
    await toggleCategoryStatus(cat.id, newStatus);
    await loadCatalogs();
    await refreshIncidents();
  };

  const handleSaveLocation = async () => {
    if (!locBuilding.trim() || !locRoom.trim()) {
      Alert.alert('Campos requeridos', 'Indica al menos el edificio y el aula/ambiente.');
      return;
    }
    await saveLocation({
      building: locBuilding.trim(),
      floor: locFloor.trim() || 'Piso 1',
      room: locRoom.trim(),
    });
    setLocBuilding('');
    setLocFloor('');
    setLocRoom('');
    setShowLocModal(false);
    await loadCatalogs();
    await refreshIncidents();
  };

  const handleToggleLoc = async (loc: Location) => {
    const newStatus = loc.is_active === 1 ? 0 : 1;
    await toggleLocationStatus(loc.id, newStatus);
    await loadCatalogs();
    await refreshIncidents();
  };

  return (
    <View style={styles.container}>
      {/* Selector de pestañas de catálogo */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'categories' && styles.tabButtonActive]}
          onPress={() => setActiveTab('categories')}
        >
          <MaterialCommunityIcons
            name="shape"
            size={18}
            color={activeTab === 'categories' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === 'categories' && styles.tabButtonTextActive]}>
            Categorías ({categories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'locations' && styles.tabButtonActive]}
          onPress={() => setActiveTab('locations')}
        >
          <MaterialCommunityIcons
            name="domain"
            size={18}
            color={activeTab === 'locations' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.tabButtonText, activeTab === 'locations' && styles.tabButtonTextActive]}>
            Ubicaciones ({locations.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ================= PESTAÑA CATEGORÍAS ================= */}
        {activeTab === 'categories' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Catálogo de Categorías</Text>
                <Text style={styles.sectionSub}>Activa o desactiva las opciones disponibles en el formulario.</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowCatModal(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Nueva</Text>
              </TouchableOpacity>
            </View>

            {categories.map((cat) => (
              <View key={cat.id} style={styles.catalogCard}>
                <View style={styles.catalogCardLeft}>
                  <Text style={styles.catalogName}>{cat.name}</Text>
                  {cat.description ? <Text style={styles.catalogDesc}>{cat.description}</Text> : null}
                  <Text style={[styles.activeStatus, { color: cat.is_active === 1 ? '#16A34A' : '#94A3B8' }]}>
                    {cat.is_active === 1 ? '● Activa para reportes' : '○ Desactivada (oculta)'}
                  </Text>
                </View>

                <Switch
                  value={cat.is_active === 1}
                  onValueChange={() => handleToggleCat(cat)}
                  trackColor={{ false: '#CBD5E1', true: colors.primaryLight }}
                  thumbColor={cat.is_active === 1 ? colors.primary : '#F1F5F9'}
                />
              </View>
            ))}
          </View>
        )}

        {/* ================= PESTAÑA UBICACIONES ================= */}
        {activeTab === 'locations' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Catálogo de Ubicaciones</Text>
                <Text style={styles.sectionSub}>Estructura jerárquica de Edificio, Piso y Aula.</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowLocModal(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Nueva</Text>
              </TouchableOpacity>
            </View>

            {locations.map((loc) => (
              <View key={loc.id} style={styles.catalogCard}>
                <View style={styles.catalogCardLeft}>
                  <Text style={styles.catalogName}>
                    {loc.building} - {loc.floor}
                  </Text>
                  <Text style={styles.catalogDesc}>Ambiente / Aula: {loc.room}</Text>
                  <Text style={[styles.activeStatus, { color: loc.is_active === 1 ? '#16A34A' : '#94A3B8' }]}>
                    {loc.is_active === 1 ? '● Activa para selección' : '○ Desactivada'}
                  </Text>
                </View>

                <Switch
                  value={loc.is_active === 1}
                  onValueChange={() => handleToggleLoc(loc)}
                  trackColor={{ false: '#CBD5E1', true: colors.primaryLight }}
                  thumbColor={loc.is_active === 1 ? colors.primary : '#F1F5F9'}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Nueva Categoría */}
      <Modal visible={showCatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeader}>Crear Nueva Categoría</Text>
            <Text style={styles.modalSub}>Se mostrará a los usuarios al registrar incidencias.</Text>

            <Text style={styles.inputLbl}>Nombre de Categoría *</Text>
            <TextInput
              style={styles.inputTxt}
              placeholder="Ej: Cerrajería y Puertas"
              value={catName}
              onChangeText={setCatName}
            />

            <Text style={[styles.inputLbl, { marginTop: 10 }]}>Descripción</Text>
            <TextInput
              style={styles.inputTxt}
              placeholder="Breve detalle de qué problemas abarca..."
              value={catDesc}
              onChangeText={setCatDesc}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowCatModal(false)}>
                <Text style={styles.cancelModalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveCategory}>
                <Text style={styles.saveModalBtnText}>Guardar Categoría</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Nueva Ubicación */}
      <Modal visible={showLocModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeader}>Registrar Nueva Ubicación</Text>
            <Text style={styles.modalSub}>Define la jerarquía física del campus.</Text>

            <Text style={styles.inputLbl}>Edificio / Pabellón *</Text>
            <TextInput
              style={styles.inputTxt}
              placeholder="Ej: Edificio D (Laboratorios Especializados)"
              value={locBuilding}
              onChangeText={setLocBuilding}
            />

            <Text style={[styles.inputLbl, { marginTop: 10 }]}>Piso / Nivel</Text>
            <TextInput
              style={styles.inputTxt}
              placeholder="Ej: Piso 1 / Sótano"
              value={locFloor}
              onChangeText={setLocFloor}
            />

            <Text style={[styles.inputLbl, { marginTop: 10 }]}>Aula o Ambiente *</Text>
            <TextInput
              style={styles.inputTxt}
              placeholder="Ej: Laboratorio de Robótica 105"
              value={locRoom}
              onChangeText={setLocRoom}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowLocModal(false)}>
                <Text style={styles.cancelModalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveLocation}>
                <Text style={styles.saveModalBtnText}>Guardar Ubicación</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  catalogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  catalogCardLeft: {
    flex: 1,
  },
  catalogName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  catalogDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
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
  modalHeader: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  inputLbl: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  inputTxt: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    backgroundColor: '#FAFAFA',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  cancelModalBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveModalBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveModalBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

