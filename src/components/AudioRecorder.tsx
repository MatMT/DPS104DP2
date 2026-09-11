import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

interface AudioRecorderProps {
  onAudioRecorded: (uri: string) => void;
  onAudioCleared?: () => void;
  title?: string;
  buttonLabel?: string;
  isIncidence?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioRecorded,
  onAudioCleared,
  title = 'Nota de Voz de Auditoría',
  buttonLabel = 'Grabar Nota de Voz',
  isIncidence = false,
}) => {
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  // Player para pre-escuchar el audio grabado
  const player = useAudioPlayer(recordedUri || null);
  const playerStatus = useAudioPlayerStatus(player);

  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permiso denegado',
          'Se requiere acceso al micrófono para registrar notas de voz en la auditoría.'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación de audio.');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        setRecordedUri(uri);
        onAudioRecorded(uri);
      }
    } catch (error) {
      console.error('Error al detener grabación:', error);
      Alert.alert('Error', 'No se pudo guardar la grabación.');
    }
  };

  const togglePlayback = () => {
    if (!recordedUri) return;
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleClear = () => {
    if (playerStatus.playing) {
      player.pause();
    }
    setRecordedUri(null);
    if (onAudioCleared) onAudioCleared();
  };

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isIncidence && styles.labelIncidence]}>
        {title}
      </Text>

      {/* Estado: Grabando actualmente */}
      {recorderState.isRecording ? (
        <View style={styles.recordingBox}>
          <View style={styles.indicatorRow}>
            <View style={styles.redDot} />
            <Text style={styles.recordingText}>
              Grabando: {formatDuration(recorderState.durationMillis || 0)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopRecording}
            activeOpacity={0.8}
          >
            <MaterialIcons name="stop" size={24} color="#FFFFFF" />
            <Text style={styles.stopButtonText}>Detener y Guardar Nota</Text>
          </TouchableOpacity>
        </View>
      ) : recordedUri ? (
        /* Estado: Audio ya grabado (pre-escucha y confirmación) */
        <View style={styles.recordedBox}>
          <View style={styles.recordedInfo}>
            <MaterialIcons name="mic" size={22} color="#059669" />
            <Text style={styles.recordedSuccessText}>
              Nota de voz registrada
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                playerStatus.playing ? styles.pauseButton : styles.playButton,
              ]}
              onPress={togglePlayback}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={playerStatus.playing ? 'pause' : 'play-arrow'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                {playerStatus.playing ? 'Pausar' : 'Escuchar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
              <Text style={styles.deleteButtonText}>Re-grabar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Estado: Inicial (listo para grabar) */
        <TouchableOpacity
          style={[
            styles.recordButton,
            isIncidence && styles.recordButtonIncidence,
          ]}
          onPress={startRecording}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="mic"
            size={22}
            color={isIncidence ? '#DC2626' : '#2563EB'}
          />
          <Text
            style={[
              styles.recordButtonText,
              isIncidence && styles.recordButtonTextIncidence,
            ]}
          >
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  labelIncidence: {
    color: '#DC2626',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderStyle: 'dashed',
  },
  recordButtonIncidence: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  recordButtonText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },
  recordButtonTextIncidence: {
    color: '#DC2626',
  },
  recordingBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  recordingText: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 14,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  recordedBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  recordedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  recordedSuccessText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  playButton: {
    backgroundColor: '#059669',
  },
  pauseButton: {
    backgroundColor: '#D97706',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
});
