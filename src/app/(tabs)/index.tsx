import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CatalogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catálogo de Inventario</Text>
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
