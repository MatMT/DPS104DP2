import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudit } from '../../context/AuditContext';
import { AuditEntry } from '../../types/AuditEntry';
import { AuditLogItem } from '../../components/AuditLogItem';
import { UpdateAudioModal } from '../../components/UpdateAudioModal';

export default function AuditLogScreen() {
  const { auditLogs, deleteAuditEntry, clearAuditLogs } = useAudit();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedAudioEntry, setSelectedAudioEntry] = useState<AuditEntry | null>(null);

  const filteredLogs = useMemo(() => {
    if (filterType === 'ALL') return auditLogs;
    return auditLogs.filter((log) => log.actionType === filterType);
  }, [auditLogs, filterType]);

  const incidenceCount = useMemo(() => {
    return auditLogs.filter((l) => l.actionType === 'INCIDENCE').length;
  }, [auditLogs]);

  const checkCount = useMemo(() => {
    return auditLogs.filter((l) => l.actionType === 'AUDIT_CHECK').length;
  }, [auditLogs]);

  const handleClearAll = () => {
    if (auditLogs.length === 0) return;

    Alert.alert(
      'Vaciar Bitácora',
      '¿Estás seguro de que deseas eliminar todas las auditorías registradas? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar Todo',
          style: 'destructive',
          onPress: () => clearAuditLogs(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Resumen de la Bitácora */}
      <View style={styles.summaryBox}>
        <View style={styles.statCol}>
          <Text style={styles.statNum}>{auditLogs.length}</Text>
          <Text style={styles.statLbl}>Total Registros</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: '#DC2626' }]}>
            {incidenceCount}
          </Text>
          <Text style={styles.statLbl}>Incidencias</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={[styles.statNum, { color: '#059669' }]}>
            {checkCount}
          </Text>
          <Text style={styles.statLbl}>Verificados</Text>
        </View>
      </View>

      {/* Barra de Filtros y Acción de Limpiar */}
      <View style={styles.filterBar}>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.chip,
              filterType === 'ALL' && styles.chipActive,
            ]}
            onPress={() => setFilterType('ALL')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                filterType === 'ALL' && styles.chipTextActive,
              ]}
            >
              Todos ({auditLogs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              filterType === 'INCIDENCE' && styles.chipActiveIncidence,
            ]}
            onPress={() => setFilterType('INCIDENCE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                filterType === 'INCIDENCE' && styles.chipTextActive,
              ]}
            >
              Incidencias ({incidenceCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chip,
              filterType === 'AUDIT_CHECK' && styles.chipActiveCheck,
            ]}
            onPress={() => setFilterType('AUDIT_CHECK')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                filterType === 'AUDIT_CHECK' && styles.chipTextActive,
              ]}
            >
              Conteos ({checkCount})
            </Text>
          </TouchableOpacity>
        </View>

        {auditLogs.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-sweep" size={20} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de Registros con FlatList */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AuditLogItem
            item={item}
            onDelete={deleteAuditEntry}
            onEditAudio={(entry) => setSelectedAudioEntry(entry)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment-late" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sin registros en la bitácora</Text>
            <Text style={styles.emptySubtitle}>
              Escanea un producto con la cámara o selecciona un ítem en el inventario para registrar tu primera auditoría con GPS y nota de voz.
            </Text>
          </View>
        }
      />

      {/* Modal para agregar o reemplazar nota de voz en registro existente */}
      <UpdateAudioModal
        visible={!!selectedAudioEntry}
        entry={selectedAudioEntry}
        onClose={() => setSelectedAudioEntry(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLbl: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipActiveIncidence: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  chipActiveCheck: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  clearBtn: {
    padding: 6,
    marginLeft: 8,
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});
