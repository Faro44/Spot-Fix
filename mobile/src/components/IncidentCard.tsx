import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Incident } from '../types';
import { colors } from '../theme/colors';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  incident: Incident;
  onPress: () => void;
  onUpvote?: () => void;
  showUpvoteButton?: boolean;
}

export const IncidentCard: React.FC<Props> = ({
  incident,
  onPress,
  onUpvote,
  showUpvoteButton = true,
}) => {
  const formattedDate = new Date(incident.created_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={styles.categoryContainer}>
          <MaterialCommunityIcons name="tag-outline" size={14} color={colors.primary} />
          <Text style={styles.categoryText}>{incident.category_name || 'General'}</Text>
        </View>

        <StatusBadge status={incident.status} size="small" />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {incident.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>

      {incident.image_uri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: incident.image_uri }} style={styles.imageThumbnail} />
          <View style={styles.imageBadge}>
            <MaterialCommunityIcons name="camera" size={12} color="#FFFFFF" />
            <Text style={styles.imageBadgeText}>Foto adjunta</Text>
          </View>
        </View>
      )}

      <View style={styles.locationRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.locationText} numberOfLines={1}>
          {incident.location_name || 'Ubicación no especificada'}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <PriorityBadge priority={incident.priority} size="small" />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {showUpvoteButton && (
          <TouchableOpacity
            style={styles.upvoteBtn}
            onPress={(e) => {
              e.stopPropagation();
              onUpvote?.();
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="thumb-up-outline" size={14} color={colors.secondary} />
            <Text style={styles.upvoteText}>{incident.upvotes_count || 1}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  imagePreviewContainer: {
    marginBottom: 10,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
});

