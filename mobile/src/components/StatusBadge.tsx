import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IncidentStatus } from '../types';
import { statusColors } from '../theme/colors';

interface Props {
  status: IncidentStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'medium' }) => {
  const config = statusColors[status] || { bg: '#E2E8F0', text: '#334155', label: status };

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
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
  },
});

