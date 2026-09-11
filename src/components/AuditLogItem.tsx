import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AuditEntry } from '../types/AuditEntry';

interface AuditLogItemProps {
  item: AuditEntry;
  onDelete?: (id: string) => void;
  onEditAudio?: (entry: AuditEntry) => void;
}

export const AuditLogItem: React.FC<AuditLogItemProps> = ({
  item,
  onDelete,
  onEditAudio,
}) => {
  // Configuración del reproductor para la nota de voz si existe
  const player = useAudioPlayer(item.audioNoteUrl || null);
  const status = useAudioPlayerStatus(player);

  const togglePlayback = () => {
    if (!item.audioNoteUrl) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoDate;
    }
  };

  const getActionConfig = (actionType: string) => {
    switch (actionType) {
      case 'INCIDENCE':
        return {
          label: 'Incidencia / Daño',
          bg: '#FEE2E2',
          color: '#DC2626',
          icon: 'warning',
        };
      case 'AUDIT_CHECK':
        return {
          label: 'Conteo Normal',
          bg: '#ECFDF5',
          color: '#059669',
          icon: 'check-circle',
        };
      default:
        return {
          label: 'Entrada Stock',
          bg: '#EFF6FF',
          color: '#2563EB',
          icon: 'inventory',
        };
    }
  };

  const action = getActionConfig(item.actionType);

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar Registro',
      `¿Deseas eliminar la auditoría de "${item.productTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete && onDelete(item.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Cabecera del ítem */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: action.bg }]}>
          <MaterialIcons
            name={action.icon as keyof typeof MaterialIcons.glyphMap}
            size={14}
            color={action.color}
          />
          <Text style={[styles.badgeText, { color: action.color }]}>
            {action.label}
          </Text>
        </View>

        <TouchableOpacity
          onPress={confirmDelete}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Producto auditado */}
      <Text style={styles.productTitle} numberOfLines={2}>
        {item.productTitle}
      </Text>

      {/* Metadatos: Timestamp y GPS */}
      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={15} color="#64748B" />
          <Text style={styles.metaText}>{formatTimestamp(item.timestamp)}</Text>
        </View>

        <View style={styles.metaRow}>
          <MaterialIcons name="place" size={15} color="#2563EB" />
          <Text style={styles.gpsText}>
            {item.location.latitude.toFixed(5)}, {item.location.longitude.toFixed(5)}
          </Text>
        </View>
      </View>

      {/* Reproductor de Nota de Voz de expo-audio o Botón de Adjuntar */}
      {item.audioNoteUrl ? (
        <View style={styles.audioBox}>
          <TouchableOpacity
            style={[
              styles.playBtn,
              status.playing ? styles.pauseBtn : styles.activePlayBtn,
            ]}
            onPress={togglePlayback}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={status.playing ? 'pause' : 'play-arrow'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.playBtnText}>
              {status.playing ? 'Pausar' : 'Reproducir'}
            </Text>
          </TouchableOpacity>

          <View style={styles.audioRightGroup}>
            <View style={styles.audioMeta}>
              <MaterialIcons name="graphic-eq" size={16} color="#059669" />
              <Text style={styles.audioMetaText}>
                {status.playing ? 'Sonando...' : 'Audio'}
              </Text>
            </View>

            {onEditAudio && (
              <TouchableOpacity
                style={styles.replaceBtn}
                onPress={() => onEditAudio(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={15} color="#047857" />
                <Text style={styles.replaceBtnText}>Cambiar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noAudioBox}>
          <View style={styles.noAudioRow}>
            <MaterialIcons name="mic-none" size={15} color="#94A3B8" />
            <Text style={styles.noAudioText}>Sin nota de voz</Text>
          </View>

          {onEditAudio && (
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={() => onEditAudio(item)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={15} color="#2563EB" />
              <Text style={styles.attachBtnText}>Adjuntar Audio</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 10,
  },
  metaContainer: {
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  gpsText: {
    fontSize: 12,
    color: '#1E40AF',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  audioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activePlayBtn: {
    backgroundColor: '#059669',
  },
  pauseBtn: {
    backgroundColor: '#D97706',
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 6,
  },
  audioMetaText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  audioRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  replaceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  noAudioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  noAudioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noAudioText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  attachBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
