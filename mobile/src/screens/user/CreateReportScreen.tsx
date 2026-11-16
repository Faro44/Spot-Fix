import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useIncidents } from '../../context/IncidentContext';
import { colors } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickAndCompressImage, takePhotoAndCompress } from '../../services/imageService';
import { DuplicateModal } from '../../components/DuplicateModal';
import { Incident } from '../../types';

interface Props {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const CreateReportScreen: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { categories, locations, createIncident, checkDuplicates, upvote } = useIncidents();

  // Wizard en 3 pasos (RNF-008: <2 min, máx 3 pasos)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Paso 1: Clasificación y Ubicación
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Paso 2: Detalles y Evidencia
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Paso 3: Duplicados & Confirmación
  const [duplicates, setDuplicates] = useState<Incident[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones
  const canGoToStep2 = selectedCategory !== '' && selectedLocation !== '';
  const canGoToStep3 = title.trim().length >= 5 && description.trim().length >= 10;

  const handlePickGallery = async () => {
    try {
      setIsProcessingImage(true);
      const res = await pickAndCompressImage();
      if (res) {
        setImageUri(res.uri);
      }
    } catch (err: any) {
      Alert.alert('Error con imagen', err.message || 'No se pudo seleccionar la foto.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsProcessingImage(true);
      const res = await takePhotoAndCompress();
      if (res) {
        setImageUri(res.uri);
      }
    } catch (err: any) {
      Alert.alert('Error con cámara', err.message || 'No se pudo tomar la foto.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleCheckDuplicatesAndProceed = async () => {
    if (!canGoToStep3) {
      Alert.alert('Campos incompletos', 'Ingresa un título descriptivo y al menos 10 caracteres de detalle.');
      return;
    }

    try {
      const found = await checkDuplicates(selectedCategory, selectedLocation);
      if (found.length > 0) {
        setDuplicates(found);
        setShowDuplicateModal(true);
      } else {
        setStep(3);
      }
    } catch {
      setStep(3);
    }
  };

  const handleSupportExisting = async (duplicateId: string) => {
    try {
      await upvote(duplicateId);
      setShowDuplicateModal(false);
      Alert.alert(
        '¡Apoyo Registrado!',
        'Has sumado tu voto a la incidencia existente. Así evitamos duplicados y priorizamos su solución.',
        [{ text: 'Entendido', onPress: onSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSubmitFinal = async () => {
    try {
      setIsSubmitting(true);
      await createIncident({
        title: title.trim(),
        description: description.trim(),
        category_id: selectedCategory,
        location_id: selectedLocation,
        image_uri: imageUri,
        priority: 'media',
      });

      Alert.alert(
        '¡Reporte Registrado con Éxito!',
        'Tu incidencia ha sido enviada al equipo directivo con el estado "Recibida". Recibirás avisos de su seguimiento.',
        [{ text: 'Aceptar', onPress: onSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Error al registrar', err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCatObj = categories.find((c) => c.id === selectedCategory);
  const selectedLocObj = locations.find((l) => l.id === selectedLocation);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Barra de progreso de 3 pasos (RNF-008) */}
      <View style={styles.progressContainer}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Categoría</Text>
        </View>

        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Detalles</Text>
        </View>

        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= 3 && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirmar</Text>
        </View>
      </View>

      {/* ===================== PASO 1 ===================== */}
      {step === 1 && (
        <View style={styles.stepBox}>
          <Text style={styles.sectionHeading}>Paso 1: ¿Dónde y qué problema ocurrió?</Text>
          <Text style={styles.sectionSubheading}>
            Selecciona la categoría del fallo y el lugar exacto dentro de la institución.
          </Text>

          <Text style={styles.inputTitle}>Categoría del Problema *</Text>
          <View style={styles.chipGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="wrench-outline"
                    size={20}
                    color={isSelected ? '#FFFFFF' : colors.primary}
                  />
                  <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.inputTitle, { marginTop: 16 }]}>Ubicación Institucional *</Text>
          <View style={styles.locationList}>
            {locations.map((loc) => {
              const isSelected = selectedLocation === loc.id;
              return (
                <TouchableOpacity
                  key={loc.id}
                  style={[styles.locationItem, isSelected && styles.locationItemSelected]}
                  onPress={() => setSelectedLocation(loc.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={20}
                    color={isSelected ? colors.secondary : colors.textSecondary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.locationBuilding, isSelected && styles.locationTextSelected]}>
                      {loc.building} ({loc.floor})
                    </Text>
                    <Text style={styles.locationRoom}>{loc.room}</Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.secondary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, !canGoToStep2 && styles.btnDisabled]}
            disabled={!canGoToStep2}
            onPress={() => setStep(2)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Continuar a Detalles</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* ===================== PASO 2 ===================== */}
      {step === 2 && (
        <View style={styles.stepBox}>
          <Text style={styles.sectionHeading}>Paso 2: Describe el problema y adjunta foto</Text>
          <Text style={styles.sectionSubheading}>
            Describe claramente la falla. Una fotografía opcional ayuda a agilizar la solución.
          </Text>

          <Text style={styles.inputTitle}>Título Resumen del Problema *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Fuga de agua en grifo de baño o proyector sin encender"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text style={[styles.inputTitle, { marginTop: 14 }]}>Descripción Detallada *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Detalla cómo ocurrió, síntomas de la falla, si representa un riesgo..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={[styles.inputTitle, { marginTop: 14 }]}>Fotografía de Evidencia (Opcional)</Text>
          <Text style={styles.helperText}>
            Las fotos se comprimen automáticamente a menos de 5 MB (RNF-009).
          </Text>

          {imageUri ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(undefined)}>
                <MaterialCommunityIcons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.removeImageText}>Eliminar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActionsRow}>
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={handleTakePhoto}
                disabled={isProcessingImage}
                activeOpacity={0.8}
              >
                {isProcessingImage ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera" size={22} color={colors.primary} />
                    <Text style={styles.photoBtnText}>Tomar Foto</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoBtn}
                onPress={handlePickGallery}
                disabled={isProcessingImage}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="image" size={22} color={colors.primary} />
                <Text style={styles.photoBtnText}>Galería</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
              <Text style={styles.secondaryBtnText}>Atrás</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1 }, !canGoToStep3 && styles.btnDisabled]}
              disabled={!canGoToStep3}
              onPress={handleCheckDuplicatesAndProceed}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Revisar y Enviar</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ===================== PASO 3 ===================== */}
      {step === 3 && (
        <View style={styles.stepBox}>
          <Text style={styles.sectionHeading}>Paso 3: Confirmación y Envío</Text>
          <Text style={styles.sectionSubheading}>
            Revisa que toda la información esté correcta antes de registrarla.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Categoría:</Text>
              <Text style={styles.summaryValue}>{selectedCatObj?.name}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ubicación:</Text>
              <Text style={styles.summaryValue}>
                {selectedLocObj?.building} - {selectedLocObj?.floor} ({selectedLocObj?.room})
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Título:</Text>
              <Text style={styles.summaryValue}>{title}</Text>
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={styles.summaryLabel}>Descripción:</Text>
              <Text style={[styles.summaryValue, { marginTop: 4 }]}>{description}</Text>
            </View>

            {imageUri && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.summaryLabel}>Foto adjunta:</Text>
                <Image source={{ uri: imageUri }} style={styles.finalThumbnail} />
              </View>
            )}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep(2)}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
              <Text style={styles.secondaryBtnText}>Modificar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.statusSolved }]}
              onPress={handleSubmitFinal}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-all" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Registrar Incidencia</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal avisador de duplicados (RF-011) */}
      <DuplicateModal
        visible={showDuplicateModal}
        duplicates={duplicates}
        onSupportExisting={handleSupportExisting}
        onProceedAnyway={() => {
          setShowDuplicateModal(false);
          setStep(3);
        }}
        onCancel={() => setShowDuplicateModal(false)}
      />
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
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  stepIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  stepBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  categoryCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  categoryNameSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  locationList: {
    gap: 8,
    marginBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 10,
  },
  locationItemSelected: {
    borderColor: colors.secondary,
    backgroundColor: '#F0F9FF',
  },
  locationBuilding: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  locationTextSelected: {
    color: colors.primary,
  },
  locationRoom: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 90,
  },
  helperText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  imagePreviewWrapper: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  removeImageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  btnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '70%',
    textAlign: 'right',
  },
  finalThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 6,
  },
});

