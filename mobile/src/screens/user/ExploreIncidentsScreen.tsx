import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from 'react-native';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types';
import { IncidentCard } from '../../components/IncidentCard';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onSelectIncident: (incident: Incident) => void;
}

export const ExploreIncidentsScreen: React.FC<Props> = ({ onSelectIncident }) => {
  const { incidents, isLoading, refreshIncidents, upvote } = useIncidents();
  const [search, setSearch] = useState('');

  const filtered = incidents.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      (i.category_name && i.category_name.toLowerCase().includes(q)) ||
      (i.location_name && i.location_name.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por falla, edificio, aula o categoría..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={colors.textMuted}
              onPress={() => setSearch('')}
            />
          )}
        </View>
        <Text style={styles.hintText}>
          Toca el botón 👍 para apoyar incidencias ya reportadas y evitar crear reportes duplicados.
        </Text>
      </View>

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
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="check-circle-outline" size={50} color={colors.statusSolved} />
            <Text style={styles.emptyTitle}>No se encontraron reportes</Text>
            <Text style={styles.emptySub}>
              No hay incidencias que coincidan con tu búsqueda en este momento.
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
  searchHeader: {
    backgroundColor: colors.card,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.text,
  },
  hintText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 15,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 50,
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

