import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onAuditPress: (product: Product) => void;
  onPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAuditPress,
  onPress,
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  const getStockStatus = (stock: number) => {
    if (stock > 60) return { color: '#059669', bg: '#D1FAE5', label: 'Stock Alto' };
    if (stock >= 30) return { color: '#D97706', bg: '#FEF3C7', label: 'Stock Medio' };
    return { color: '#DC2626', bg: '#FEE2E2', label: 'Stock Bajo' };
  };

  const stockStatus = getStockStatus(product.expectedStock);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress && onPress(product)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.barcodeRow}>
          <MaterialIcons name="qr-code" size={14} color="#64748B" />
          <Text style={styles.barcodeText}>{product.barcode}</Text>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Stock en Sistema</Text>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}>
              <Text style={[styles.stockText, { color: stockStatus.color }]}>
                {product.expectedStock} uds ({stockStatus.label})
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.label}>Precio Unitario</Text>
            <Text style={styles.priceText}>${product.unitPrice.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.auditButton}
          onPress={() => onAuditPress(product)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-task" size={18} color="#FFFFFF" />
          <Text style={styles.auditButtonText}>Registrar Auditoría / Incidencia</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  barcodeText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '500',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  auditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
  },
  auditButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
