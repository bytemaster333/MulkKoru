// MülkKoru — Türkçe Format Yardımcıları

// ── Para Birimi ─────────────────────────────────
export function formatCurrency(
  amount: number,
  currency = 'TRY',
  compact = false,
): string {
  if (compact && amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} M ₺`;
  }
  if (compact && amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)} B ₺`;
  }
  return new Intl.NumberFormat('tr-TR', {
    style:                 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ── Tarih ──────────────────────────────────────
export function formatDate(dateStr: string, style: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';

  if (style === 'relative') {
    return formatRelativeDate(date);
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day:   '2-digit',
    month: style === 'long' ? 'long' : '2-digit',
    year:  'numeric',
  }).format(date);
}

function formatRelativeDate(date: Date): string {
  const now      = new Date();
  const diffMs   = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)  return 'Bugün';
  if (diffDays === 1)  return 'Yarın';
  if (diffDays === -1) return 'Dün';
  if (diffDays > 0 && diffDays <= 7)  return `${diffDays} gün sonra`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} gün önce`;
  return formatDate(date.toISOString(), 'short');
}

export function formatMonthYear(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(date);
}

export function isOverdue(dueDateStr: string): boolean {
  return new Date(dueDateStr) < new Date();
}

export function daysUntil(dueDateStr: string): number {
  const diff = new Date(dueDateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── Oran ───────────────────────────────────────
export function formatPercentage(value: number, decimals = 2): string {
  return `%${value.toFixed(decimals).replace('.', ',')}`;
}

// ── Yüzölçümü ──────────────────────────────────
export function formatArea(sqm: number): string {
  return `${sqm.toLocaleString('tr-TR')} m²`;
}

// ── Mülk Tipi ──────────────────────────────────
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment:  'Daire',
  house:      'Müstakil Ev',
  commercial: 'Ticari',
  land:       'Arsa',
};

export function formatPropertyType(type: string): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

// ── Kira Artış Bazı ────────────────────────────
const INCREASE_BASIS_LABELS: Record<string, string> = {
  TUFE:   'TÜFE Bazlı',
  FIXED:  'Sabit Oran',
  AGREED: 'Anlaşmalı',
};

export function formatIncreaseBasis(basis: string): string {
  return INCREASE_BASIS_LABELS[basis] ?? basis;
}

// ── Sözleşme Durumu ────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  active:     'Aktif',
  expired:    'Süresi Dolmuş',
  terminated: 'Feshedildi',
  pending:    'Bekliyor',
  paid:       'Ödendi',
  partial:    'Kısmi Ödeme',
  overdue:    'Gecikmiş',
  open:       'Açık',
  in_progress: 'Devam Ediyor',
  resolved:   'Çözüldü',
  closed:     'Kapatıldı',
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

// ── Ödeme günü ─────────────────────────────────
export function formatPaymentDay(day: number): string {
  return `Her ayın ${day}. günü`;
}
