import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudit } from '../../context/AuditContext';
import { Product } from '../../types/Product';
import { CameraScanner } from '../../components/CameraScanner';
import { AuditModal } from '../../components/AuditModal';

export default function ScannerScreen() {
  const { products, getProductByBarcode } = useAudit();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [isAuditingProduct, setIsAuditingProduct] = useState<Product | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleBarcodeScanned = (barcode: string) => {
    if (isPaused || matchedProduct || showNotFoundModal) return;

    setIsPaused(true);
    setScannedBarcode(barcode);

    const product = getProductByBarcode(barcode);

    if (product) {
      setMatchedProduct(product);
    } else {
      setShowNotFoundModal(true);
    }
  };

  const handleDismissScan = () => {
    setMatchedProduct(null);
    setShowNotFoundModal(false);
    setScannedBarcode(null);
    setIsPaused(false);
  };

  const handleStartAudit = () => {
    if (matchedProduct) {
      const prod = matchedProduct;
      setMatchedProduct(null);
      setIsAuditingProduct(prod);
    }
  };

  // Simulación para pruebas rápidas en emulador o defensa sin cámara física
  const handleSimulateScan = (product: Product) => {
    handleBarcodeScanned(product.barcode);
  };

  return (
    <View style={styles.container}>
      {/* Visor de Cámara con Escáner */}
      <CameraScanner
        onBarcodeScanned={handleBarcodeScanned}
        isPaused={isPaused}
      />

      {/* Botón flotante para simulación en Emulador */}
      <View style={styles.emulatorBar}>
        <TouchableOpacity
          style={styles.simulateBtn}
          onPress={() => {
            Alert.alert(
              'Simulador de Escáner (Pruebas)',
              'Selecciona un código de barras para probar sin cámara física:',
              [
                ...products.slice(0, 3).map((p) => ({
                  text: `${p.barcode} (${p.category})`,
                  onPress: () => handleSimulateScan(p),
                })),
                {
                  text: 'Código Inexistente (Error 404)',
                  onPress: () => handleBarcodeScanned('9999999999999'),
                  style: 'destructive',
                },
                { text: 'Cancelar', style: 'cancel' },
              ]
            );
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="qr-code" size={18} color="#FFFFFF" />
          <Text style={styles.simulateText}>Probar en Emulador</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Ficha de Detalle del Producto Detectado */}
      <Modal
        visible={!!matchedProduct}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDismissScan}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.matchBadge}>
                <MaterialIcons name="check-circle" size={16} color="#059669" />
                <Text style={styles.matchBadgeText}>Producto Encontrado en Bodega</Text>
              </View>
              <TouchableOpacity onPress={handleDismissScan} style={styles.closeBtn}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {matchedProduct && (
              <View style={styles.productDetails}>
                <Image
                  source={{ uri: matchedProduct.imageUrl }}
                  style={styles.productImg}
                  resizeMode="cover"
                />

                <View style={styles.infoContainer}>
                  <Text style={styles.productCategory}>{matchedProduct.category}</Text>
                  <Text style={styles.productTitle}>{matchedProduct.title}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Código</Text>
                      <Text style={styles.metaValue}>{matchedProduct.barcode}</Text>
                    </View>
                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Stock Esperado</Text>
                      <Text style={styles.metaValueStock}>
                        {matchedProduct.expectedStock} uds
                      </Text>
                    </View>
                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>Precio Unitario</Text>
                      <Text style={styles.metaValuePrice}>
                        ${matchedProduct.unitPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.auditNowBtn}
                    onPress={handleStartAudit}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="add-task" size={20} color="#FFFFFF" />
                    <Text style={styles.auditNowText}>Registrar Auditoría / Incidencia</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rescanBtn}
                    onPress={handleDismissScan}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="refresh" size={18} color="#475569" />
                    <Text style={styles.rescanText}>Seguir Escaneando</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Producto No Encontrado */}
      <Modal
        visible={showNotFoundModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDismissScan}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.notFoundCard}>
            <MaterialIcons name="error-outline" size={54} color="#DC2626" />
            <Text style={styles.notFoundTitle}>Código No Registrado</Text>
            <Text style={styles.notFoundSubtitle}>
              El código escaneado ({scannedBarcode}) no coincide con ningún producto del inventario actual.
            </Text>
            <TouchableOpacity
              style={styles.notFoundBtn}
              onPress={handleDismissScan}
              activeOpacity={0.8}
            >
              <Text style={styles.notFoundBtnText}>Reintentar Escaneo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Auditoría (GPS + Audio) */}
      <AuditModal
        visible={!!isAuditingProduct}
        product={isAuditingProduct}
        onClose={() => {
          setIsAuditingProduct(null);
          handleDismissScan();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emulatorBar: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  simulateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  matchBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  productDetails: {
    gap: 14,
  },
  productImg: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  infoContainer: {
    gap: 4,
  },
  productCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  metaBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  metaValueStock: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  metaValuePrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionButtons: {
    gap: 10,
    marginTop: 6,
  },
  auditNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
  },
  auditNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  rescanText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  notFoundBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
