import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuditEntry } from '../types/AuditEntry';
import { AudioRecorder } from './AudioRecorder';
import { useAudit } from '../context/AuditContext';

interface UpdateAudioModalProps {
  visible: boolean;
  entry: AuditEntry | null;
  onClose: () => void;
}

export const UpdateAudioModal: React.FC<UpdateAudioModalProps> = ({
  visible,
  entry,
  onClose,
}) => {
  const { updateAuditAudio } = useAudit();
  const [newAudioUri, setNewAudioUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!entry || !newAudioUri) {
      Alert.alert('Audio requerido', 'Debes grabar una nota de voz antes de guardar.');
      return;
    }

    try {
      setSaving(true);
      await updateAuditAudio(entry.id, newAudioUri);
      Alert.alert(
        '✅ Audio Actualizado',
        `Se ha ${entry.audioNoteUrl ? 'reemplazado' : 'adjuntado'} la nota de voz para "${entry.productTitle}".`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              setNewAudioUri(null);
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al actualizar audio:', error);
      Alert.alert('Error', 'No se pudo guardar la nota de voz.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewAudioUri(null);
    onClose();
  };

  if (!entry) return null;

  const isReplacing = !!entry.audioNoteUrl;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialIcons name="mic" size={22} color="#2563EB" />
              <Text style={styles.headerTitle}>
                {isReplacing ? 'Reemplazar Nota de Voz' : 'Adjuntar Nota de Voz'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {entry.productTitle}
            </Text>
            <Text style={styles.subtitle}>
              {isReplacing
                ? 'Graba un nuevo audio para sobrescribir la nota de voz actual de este registro.'
                : 'Graba una nota de voz para adjuntarla como evidencia a este registro de auditoría.'}
            </Text>

            <AudioRecorder
              title="Grabación de Audio"
              buttonLabel="Iniciar Grabación de Nota"
              isIncidence={entry.actionType === 'INCIDENCE'}
              onAudioRecorded={(uri) => setNewAudioUri(uri)}
              onAudioCleared={() => setNewAudioUri(null)}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                !newAudioUri && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={saving || !newAudioUri}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Guardar Audio</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 18,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
