import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IncidentPriority } from '../types';
import { priorityColors } from '../theme/colors';

interface Props {
  priority: IncidentPriority;
  size?: 'small' | 'medium';
}

export const PriorityBadge: React.FC<Props> = ({ priority, size = 'medium' }) => {
  const config = priorityColors[priority] || { bg: '#E2E8F0', text: '#334155', label: priority };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'small' && styles.badgeSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          size === 'small' && styles.textSmall,
        ]}
      >
        PRIORIDAD {config.label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 9,
  },
});

