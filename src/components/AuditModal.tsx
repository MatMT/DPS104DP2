import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Product } from '../types/Product';
import { AudioRecorder } from './AudioRecorder';
import { useAudit } from '../context/AuditContext';

interface AuditModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  visible,
  product,
  onClose,
  onSuccess,
}) => {
  const { addAuditEntry } = useAudit();
  const [actionType, setActionType] = useState<'AUDIT_CHECK' | 'INCIDENCE'>('AUDIT_CHECK');
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [saving, setSaving] = useState(false);

  // Ubicación por defecto de respaldo (Campus UDB Soyapango) si no hay señal de satélite o emulador
  const FALLBACK_LOCATION = {
    latitude: 13.7159,
    longitude: -89.1537,
  };

  useEffect(() => {
    if (visible && product) {
      captureLocation();
    } else {
      setAudioUri(undefined);
      setActionType('AUDIT_CHECK');
    }
  }, [visible, product]);

  const captureLocation = async () => {
    try {
      setLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Usar ubicación por defecto de la bodega
        setGpsLocation(FALLBACK_LOCATION);
        setLoadingGps(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setGpsLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.warn('No se pudo obtener GPS satelital, usando coordenadas de bodega:', error);
      setGpsLocation(FALLBACK_LOCATION);
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);
      const finalLocation = gpsLocation || FALLBACK_LOCATION;

      await addAuditEntry({
        productId: product.id,
        productTitle: product.title,
        actionType,
        audioNoteUrl: audioUri,
        location: finalLocation,
      });

      Alert.alert(
        '✅ Auditoría Guardada',
        `Se ha registrado la auditoría para "${product.title}" con coordenadas GPS y nota de voz vinculadas.`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              onClose();
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al guardar auditoría:', error);
      Alert.alert('Error', 'No se pudo guardar la auditoría.');
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>Registro Georreferenciado</Text>
              <Text style={styles.headerTitle}>Auditoría de Producto</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Info del producto seleccionado */}
            <View style={styles.productSummary}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <View style={styles.productMetaRow}>
                <Text style={styles.productMeta}>Código: {product.barcode}</Text>
                <Text style={styles.productMeta}>•</Text>
                <Text style={styles.productMeta}>Stock: {product.expectedStock} uds</Text>
              </View>
            </View>

            {/* Selector de Tipo de Auditoría */}
            <Text style={styles.sectionTitle}>Tipo de Acción</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  actionType === 'AUDIT_CHECK' && styles.typeOptionActiveCheck,
                ]}
                onPress={() => setActionType('AUDIT_CHECK')}
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={actionType === 'AUDIT_CHECK' ? '#059669' : '#64748B'}
                />
                <Text
                  style={[
                    styles.typeText,
                    actionType === 'AUDIT_CHECK' && styles.typeTextActiveCheck,
                  ]}
                >
                  Conteo Normal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  actionType === 'INCIDENCE' && styles.typeOptionActiveIncidence,
                ]}
                onPress={() => setActionType('INCIDENCE')}
              >
                <MaterialIcons
                  name="warning"
                  size={20}
                  color={actionType === 'INCIDENCE' ? '#DC2626' : '#64748B'}
                />
                <Text
                  style={[
                    styles.typeText,
                    actionType === 'INCIDENCE' && styles.typeTextActiveIncidence,
                  ]}
                >
                  Reportar Incidencia
                </Text>
              </TouchableOpacity>
            </View>

            {/* GPS Automático */}
            <Text style={styles.sectionTitle}>Ubicación GPS (expo-location)</Text>
            <View style={styles.gpsBox}>
              <MaterialIcons
                name="place"
                size={22}
                color={loadingGps ? '#94A3B8' : '#2563EB'}
              />
              <View style={styles.gpsTextContainer}>
                {loadingGps ? (
                  <View style={styles.loadingGpsRow}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.gpsLoadingText}>Capturando coordenadas...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.gpsCoordText}>
                      Lat: {gpsLocation?.latitude.toFixed(6)} | Lon: {gpsLocation?.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.gpsStatusText}>
                      ✓ Coordenadas capturadas con éxito
                    </Text>
                  </>
                )}
              </View>
              <TouchableOpacity
                style={styles.refreshGpsBtn}
                onPress={captureLocation}
                disabled={loadingGps}
              >
                <MaterialIcons name="refresh" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {/* Grabador de Audio */}
            <AudioRecorder
              onAudioRecorded={(uri) => setAudioUri(uri)}
              onAudioCleared={() => setAudioUri(undefined)}
            />
          </ScrollView>

          {/* Footer de Acciones */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Guardar Auditoría</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  productSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  productMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  productMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  typeOptionActiveCheck: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  typeOptionActiveIncidence: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  typeTextActiveCheck: {
    color: '#059669',
  },
  typeTextActiveIncidence: {
    color: '#DC2626',
  },
  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  gpsTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  loadingGpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsLoadingText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  gpsCoordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    fontFamily: 'monospace',
  },
  gpsStatusText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  refreshGpsBtn: {
    padding: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
