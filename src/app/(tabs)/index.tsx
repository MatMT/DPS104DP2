import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudit } from '../../context/AuditContext';
import { Product } from '../../types/Product';
import { SearchBar } from '../../components/SearchBar';
import { ProductCard } from '../../components/ProductCard';
import { AuditModal } from '../../components/AuditModal';

export default function CatalogScreen() {
  const { products } = useAudit();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedProductForAudit, setSelectedProductForAudit] = useState<Product | null>(null);

  // Extraer categorías únicas
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['TODOS', ...Array.from(set)];
  }, [products]);

  // Filtrado reactivo e insensible a mayúsculas/minúsculas
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'TODOS' || product.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const titleMatch = product.title.toLowerCase().includes(query);
      const categoryMatch = product.category.toLowerCase().includes(query);
      const barcodeMatch = product.barcode.toLowerCase().includes(query);

      return titleMatch || categoryMatch || barcodeMatch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Estadísticas rápidas del almacén
  const totalStock = useMemo(() => {
    return products.reduce((acc, p) => acc + p.expectedStock, 0);
  }, [products]);

  return (
    <View style={styles.container}>
      {/* Resumen Superior */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="category" size={20} color="#2563EB" />
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="inventory-2" size={20} color="#059669" />
          <Text style={styles.statNumber}>{totalStock}</Text>
          <Text style={styles.statLabel}>Unidades Stock</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="filter-alt" size={20} color="#D97706" />
          <Text style={styles.statNumber}>{categories.length - 1}</Text>
          <Text style={styles.statLabel}>Categorías</Text>
        </View>
      </View>

      {/* Buscador Interactivo */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por producto, categoría o código..."
      />

      {/* Selector Horizontal de Categorías */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de Productos con FlatList */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAuditPress={(prod) => setSelectedProductForAudit(prod)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No se encontraron productos</Text>
            <Text style={styles.emptySubtitle}>
              Intenta con otro término de búsqueda o categoría.
            </Text>
          </View>
        }
      />

      {/* Modal de Auditoría con GPS y Audio */}
      <AuditModal
        visible={!!selectedProductForAudit}
        product={selectedProductForAudit}
        onClose={() => setSelectedProductForAudit(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  categoriesWrapper: {
    marginBottom: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    marginTop: 4,
  },
});
