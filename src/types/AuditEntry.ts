export interface AuditEntry {
  id: string;
  productId: string;
  productTitle: string;
  timestamp: string;
  actionType: 'AUDIT_CHECK' | 'INCIDENCE' | 'STOCK_RECEIPT';
  audioNoteUrl?: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
