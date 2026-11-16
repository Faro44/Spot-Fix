import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, IncidentStatus, IncidentPriority } from '../../types';
import { IncidentCard } from '../../components/IncidentCard';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onSelectIncident: (incident: Incident) => void;
}

export const DirectorInboxScreen: React.FC<Props> = ({ onSelectIncident }) => {
  const { incidents, categories, locations, isLoading, refreshIncidents, upvote } = useIncidents();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrado multidimensional (RF-009)
  const filtered = incidents.filter((i) => {
    if (selectedStatus !== 'all' && i.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && i.priority !== selectedPriority) return false;
    if (selectedCategory !== 'all' && i.category_id !== selectedCategory) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = i.title.toLowerCase().includes(q);
      const matchDesc = i.description.toLowerCase().includes(q);
      const matchCat = i.category_name?.toLowerCase().includes(q) || false;
      const matchLoc = i.location_name?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchCat && !matchLoc) return false;
    }

    return true;
  });

  const countReceived = incidents.filter((i) => i.status === 'recibida').length;
  const countInProcess = incidents.filter((i) => i.status === 'en proceso').length;
  const countHighPriority = incidents.filter((i) => i.priority === 'alta' && i.status !== 'solucionada').length;

  return (
    <View style={styles.container}>
      {/* Resumen rápido de directiva */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiBox, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
          <Text style={[styles.kpiNumber, { color: '#4338CA' }]}>{countReceived}</Text>
          <Text style={styles.kpiLabel}>Nuevas (Recibidas)</Text>
        </View>

        <View style={[styles.kpiBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
          <Text style={[styles.kpiNumber, { color: '#B45309' }]}>{countInProcess}</Text>
          <Text style={styles.kpiLabel}>En Proceso</Text>
        </View>

        <View style={[styles.kpiBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
          <Text style={[styles.kpiNumber, { color: '#B91C1C' }]}>{countHighPriority}</Text>
          <Text style={styles.kpiLabel}>Alta Prioridad</Text>
        </View>
      </View>

      {/* Barra de búsqueda y botón de filtros */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchField}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descripción, aula, técnico..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={colors.textMuted}
              onPress={() => setSearch('')}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterToggleBtn, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={showFilters ? 'filter-check' : 'filter-variant'}
            size={20}
            color={showFilters ? '#FFFFFF' : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Panel desplegable de filtros multidimensionales (RF-009) */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Estado:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {[
                { label: 'Todos', val: 'all' },
                { label: 'Recibida', val: 'recibida' },
                { label: 'En proceso', val: 'en proceso' },
                { label: 'Solucionada', val: 'solucionada' },
                { label: 'No procedente', val: 'no procedente' },
              ].map((s) => (
                <TouchableOpacity
                  key={s.val}
                  style={[styles.chip, selectedStatus === s.val && styles.chipActive]}
                  onPress={() => setSelectedStatus(s.val)}
                >
                  <Text style={[styles.chipText, selectedStatus === s.val && styles.chipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Prioridad:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {[
                { label: 'Todas', val: 'all' },
                { label: 'Alta', val: 'alta' },
                { label: 'Media', val: 'media' },
                { label: 'Baja', val: 'baja' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.val}
                  style={[styles.chip, selectedPriority === p.val && styles.chipActive]}
                  onPress={() => setSelectedPriority(p.val)}
                >
                  <Text style={[styles.chipText, selectedPriority === p.val && styles.chipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterTitle}>Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'all' && styles.chipActive]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive]}>
                  Todas las categorías
                </Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, selectedCategory === c.id && styles.chipActive]}
                  onPress={() => setSelectedCategory(c.id)}
                >
                  <Text style={[styles.chipText, selectedCategory === c.id && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.resetFiltersBtn}
            onPress={() => {
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSelectedCategory('all');
              setSearch('');
            }}
          >
            <Text style={styles.resetFiltersText}>Restablecer filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de incidencias con información de auditoría y gestión */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIncidents} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <IncidentCard
            incident={item}
            onPress={() => onSelectIncident(item)}
            onUpvote={() => upvote(item.id)}
            showUpvoteButton={true}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="inbox-outline" size={54} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No hay incidencias que coincidan</Text>
            <Text style={styles.emptySub}>
              Prueba cambiando o limpiando los filtros de búsqueda.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kpiRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kpiBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  kpiNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  searchBarRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: colors.card,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  filterToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  filterToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtersPanel: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resetFiltersBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  resetFiltersText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

