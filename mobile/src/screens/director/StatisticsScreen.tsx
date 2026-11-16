import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useIncidents } from '../../context/IncidentContext';
import { calculateStats, generateAndSharePdfReport } from '../../services/pdfService';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const StatisticsScreen: React.FC = () => {
  const { incidents } = useIncidents();
  const [isExporting, setIsExporting] = useState(false);

  const stats = calculateStats(incidents);

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      await generateAndSharePdfReport(incidents);
    } catch (err: any) {
      Alert.alert('Error al exportar', err.message || 'No se pudo generar el documento PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.exportBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Reporte Ejecutivo Institucional</Text>
          <Text style={styles.bannerSubtitle}>
            Genera un informe con indicadores clave, tiempos promedio y distribución por áreas.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExportPdf}
          disabled={isExporting}
          activeOpacity={0.85}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Exportar PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Tarjetas KPI Superiores */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{stats.total}</Text>
          <Text style={styles.kpiLabel}>Total Reportadas</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: colors.statusSolved }]}>{stats.solved}</Text>
          <Text style={styles.kpiLabel}>Solucionadas</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: colors.statusInProcess }]}>{stats.inProcess}</Text>
          <Text style={styles.kpiLabel}>En Proceso</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{stats.avgResolutionDays} d</Text>
          <Text style={styles.kpiLabel}>Tiempo Promedio</Text>
        </View>
      </View>

      {/* Distribución por Estado */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Distribución por Estado Actual</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Recibidas (Nuevas)</Text>
          <Text style={styles.statVal}>{stats.received}</Text>
        </View>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${stats.total > 0 ? (stats.received / stats.total) * 100 : 0}%`,
                backgroundColor: colors.statusReceived,
              },
            ]}
          />
        </View>

        <View style={[styles.statRow, { marginTop: 10 }]}>
          <Text style={styles.statLabel}>En Proceso de Reparación</Text>
          <Text style={styles.statVal}>{stats.inProcess}</Text>
        </View>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${stats.total > 0 ? (stats.inProcess / stats.total) * 100 : 0}%`,
                backgroundColor: colors.statusInProcess,
              },
            ]}
          />
        </View>

        <View style={[styles.statRow, { marginTop: 10 }]}>
          <Text style={styles.statLabel}>Solucionadas Satisfactoriamente</Text>
          <Text style={styles.statVal}>{stats.solved}</Text>
        </View>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${stats.total > 0 ? (stats.solved / stats.total) * 100 : 0}%`,
                backgroundColor: colors.statusSolved,
              },
            ]}
          />
        </View>

        <View style={[styles.statRow, { marginTop: 10 }]}>
          <Text style={styles.statLabel}>No Procedentes / Canceladas</Text>
          <Text style={styles.statVal}>{stats.rejected}</Text>
        </View>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%`,
                backgroundColor: colors.statusRejected,
              },
            ]}
          />
        </View>
      </View>

      {/* Distribución por Categoría */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Incidencias por Categoría</Text>
        {stats.categoryBreakdown.map((item) => (
          <View key={item.name} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownName}>{item.name}</Text>
              <Text style={styles.breakdownCount}>{item.count} reportes</Text>
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`,
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Distribución por Ubicación */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Incidencias por Ubicación Frecuente</Text>
        {stats.locationBreakdown.map((item) => (
          <View key={item.name} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.breakdownCount}>{item.count} casos</Text>
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`,
                    backgroundColor: '#8B5CF6',
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  exportBanner: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    maxWidth: '75%',
  },
  breakdownCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});

