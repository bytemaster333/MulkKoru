// MülkKoru — Türk Borçlar Kanunu (TBK) Sabitleri
// Güncel Mevzuat: 6098 sayılı TBK, 01.07.2023 sonrası kira artış rejimi

export const LEGAL = {
  // ── Depozito (TBK m.342) ────────────────────
  /** Konut ve çatılı işyeri kiralarında maksimum depozito: 3 aylık kira */
  MAX_DEPOSIT_MONTHS: 3,

  // ── Kira Artışı (TBK m.344) ─────────────────
  /**
   * 01.07.2023 öncesi: %25 tavan uygulaması (geçici madde)
   * 01.07.2023 sonrası: TÜFE 12 aylık ortalamasını geçemez
   * Taraflar farklı oran belirleyebilir; konut kiralarında TÜFE sınırı geçerli.
   */
  INCREASE_BASIS: 'TUFE_12M_AVG' as const,

  // ── Tahliye / İhtar Süreleri ─────────────────
  /** TBK m.315 — Kiracı temerrüdünde yazılı ihtar süresi (gün) */
  EVICTION_NOTICE_DAYS_RESIDENTIAL: 30,
  /** TBK m.315 — Ticari kirada yazılı ihtar süresi (gün) */
  EVICTION_NOTICE_DAYS_COMMERCIAL: 60,

  /** TBK m.347 — Kiraya verenin sözleşme sona erdirme bildirimi (gün) */
  LANDLORD_TERMINATION_NOTICE_DAYS: 90,  // 3 ay önceden

  /** TBK m.347 — Kiracının sözleşme sona erdirme bildirimi (gün) */
  TENANT_TERMINATION_NOTICE_DAYS: 15,

  // ── Tahliye Taahhütnamesi (TBK m.352) ───────
  /**
   * Tahliye taahhütnamesi; sözleşme kurulduktan SONRA imzalanmalıdır.
   * Sözleşme tarihiyle aynı gün imzalananlar geçersiz sayılabilir.
   * Taahhüt tarihinden en az 1 gün sonra olmalıdır.
   */
  EVICTION_UNDERTAKING_MIN_DAYS_AFTER_CONTRACT: 1,

  // ── Sözleşme Süresi ─────────────────────────
  /** Minimum kira süresi zorunluluğu yok; ancak 1 yıl yaygın uygulamadır */
  TYPICAL_CONTRACT_DURATION_MONTHS: 12,

  // ── İhtiyaç Nedeniyle Tahliye (TBK m.350-351) ─
  /**
   * Kiraya veren, konutu kendisi/eşi/alt-üst soyu için gerekirse
   * sözleşme bitiminden 1 ay önce bildirimle tahliye talep edebilir.
   */
  NEED_BASED_EVICTION_NOTICE_DAYS: 30,

  // ── Özel Sözleşme Şartları ───────────────────
  /** TBK m.346 — Kiracı aleyhine düzenleme yasağı kapsamında geçersiz şartlar */
  VOID_TENANT_CLAUSES: [
    'Kira artışı TÜFE üzerinde zorunlu tutulmuşsa',
    'Depozito 3 aylık kiradan fazla belirlenmiş ise',
    'Sözleşme süresi dolmadan haksız tahliye hükmü varsa',
  ],
} as const;

// İhtarname türleri
export type NoticeType =
  | 'payment_default'       // Kira ödeme temerrüdü — TBK m.315
  | 'eviction_request'      // Tahliye talebi
  | 'deposit_refund'        // Depozito iadesi talebi
  | 'repair_request'        // Bakım/onarım talebi — TBK m.317
  | 'rent_increase_notice'; // Kira artış bildirimi
