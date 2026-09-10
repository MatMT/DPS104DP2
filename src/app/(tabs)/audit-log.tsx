import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AuditLogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitácora de Movimientos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
