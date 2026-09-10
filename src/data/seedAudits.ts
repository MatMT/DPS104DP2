import { AuditEntry } from '../types/AuditEntry';

// Auditorías iniciales de demostración en el área de San Salvador / Campus UDB
export const SEED_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'audit-seed-1',
    productId: 'prod-001',
    productTitle: 'Monitor Gamer 27" QHD 165Hz IPS',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actionType: 'AUDIT_CHECK',
    location: {
      latitude: 13.7159,
      longitude: -89.1537,
    },
  },
  {
    id: 'audit-seed-2',
    productId: 'prod-009',
    productTitle: 'Cámara de Seguridad IP Wi-Fi 2K Exterior',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actionType: 'INCIDENCE',
    location: {
      latitude: 13.7175,
      longitude: -89.1512,
    },
  },
  {
    id: 'audit-seed-3',
    productId: 'prod-005',
    productTitle: 'SSD NVMe PCIe 4.0 1TB 7000MB/s',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    actionType: 'AUDIT_CHECK',
    location: {
      latitude: 13.7142,
      longitude: -89.1565,
    },
  },
];
