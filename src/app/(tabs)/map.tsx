/**
 * Pantalla de Mapa Georreferenciado:
 * Visualiza la bitácora de auditorías con marcadores interactivos.
 * Emplea LocationMap con OpenStreetMap, garantizando funcionamiento sin API Key de Google.
 */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAudit } from '../../context/AuditContext';
import { AuditEntry } from '../../types/AuditEntry';
import { LocationMap } from '../../components/LocationMap';

export default function MapScreen() {
  const { auditLogs } = useAudit();
  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const fetchCurrentLocation = async () => {
    try {
      setLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Coordenadas por defecto en Campus UDB
        setCurrentCoords({ latitude: 13.7159, longitude: -89.1537 });
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.warn('Error al obtener ubicación actual para el mapa:', error);
      setCurrentCoords({ latitude: 13.7159, longitude: -89.1537 });
    } finally {
      setLoadingGps(false);
    }
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const incidencesCount = auditLogs.filter((l) => l.actionType === 'INCIDENCE').length;
  const checksCount = auditLogs.filter((l) => l.actionType === 'AUDIT_CHECK').length;

  return (
    <View style={styles.container}>
      {/* Mapa interactivo OpenStreetMap / Leaflet sin límites de pago */}
      <LocationMap
        auditEntries={auditLogs}
        currentLocation={currentCoords}
        onMarkerSelect={(entry) => setSelectedEntry(entry)}
      />

      {/* Barra Flotante Superior: Leyenda y Métricas */}
      <View style={styles.topFloatingBar}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>Incidencias ({incidencesCount})</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
          <Text style={styles.legendText}>Verificados ({checksCount})</Text>
        </View>

        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={fetchCurrentLocation}
          disabled={loadingGps}
          activeOpacity={0.8}
        >
          {loadingGps ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <MaterialIcons name="my-location" size={18} color="#2563EB" />
          )}
        </TouchableOpacity>
      </View>

      {/* Tarjeta Flotante Inferior: Detalle del Marcador Tocado */}
      {selectedEntry ? (
        <View style={styles.selectedCard}>
          <View style={styles.selectedCardHeader}>
            <View
              style={[
                styles.actionBadge,
                selectedEntry.actionType === 'INCIDENCE'
                  ? styles.actionBadgeIncidence
                  : styles.actionBadgeCheck,
              ]}
            >
              <MaterialIcons
                name={
                  selectedEntry.actionType === 'INCIDENCE'
                    ? 'warning'
                    : 'check-circle'
                }
                size={14}
                color={
                  selectedEntry.actionType === 'INCIDENCE' ? '#DC2626' : '#059669'
                }
              />
              <Text
                style={[
                  styles.actionBadgeText,
                  {
                    color:
                      selectedEntry.actionType === 'INCIDENCE'
                        ? '#DC2626'
                        : '#059669',
                  },
                ]}
              >
                {selectedEntry.actionType === 'INCIDENCE'
                  ? 'Incidencia Detectada'
                  : 'Conteo Verificado'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedEntry(null)}
              style={styles.closeCardBtn}
            >
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.selectedProductTitle} numberOfLines={2}>
            {selectedEntry.productTitle}
          </Text>

          <View style={styles.selectedMetaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={14} color="#64748B" />
              <Text style={styles.metaText}>
                {new Date(selectedEntry.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialIcons name="place" size={14} color="#2563EB" />
              <Text style={styles.metaText}>
                {selectedEntry.location.latitude.toFixed(5)},{' '}
                {selectedEntry.location.longitude.toFixed(5)}
              </Text>
            </View>

            {selectedEntry.audioNoteUrl && (
              <View style={styles.metaItem}>
                <MaterialIcons name="mic" size={14} color="#059669" />
                <Text style={[styles.metaText, { color: '#059669' }]}>
                  Con audio
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.infoBanner}>
          <MaterialIcons name="touch-app" size={18} color="#2563EB" />
          <Text style={styles.infoBannerText}>
            Toca cualquier marcador en el mapa para ver los detalles de la auditoría.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topFloatingBar: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  gpsBtn: {
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionBadgeIncidence: {
    backgroundColor: '#FEE2E2',
  },
  actionBadgeCheck: {
    backgroundColor: '#ECFDF5',
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeCardBtn: {
    padding: 2,
  },
  selectedProductTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 10,
  },
  selectedMetaRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  infoBanner: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
});
