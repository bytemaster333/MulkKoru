// MülkKoru — Form Validatörleri
// KVKK uyarınca TC Kimlik No uygulama içinde işlenir; dışarıya ham olarak sızdırılmaz.

/**
 * TC Kimlik No doğrulama algoritması.
 * Kaynak: T.C. Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü resmi algoritması.
 *
 * Kurallar:
 * 1. 11 hane olmalı
 * 2. İlk hane 0 olamaz
 * 3. İlk 10 hanenin toplamının birler basamağı = 11. hane
 * 4. (1+3+5+7+9. haneler toplamı * 7) - (2+4+6+8. haneler toplamı) → mod 10 = 10. hane
 */
export function validateTCKimlikNo(tc: string): boolean {
  const cleaned = tc.replace(/\s/g, '');
  if (!/^\d{11}$/.test(cleaned)) return false;
  if (cleaned[0] === '0') return false;

  const digits = cleaned.split('').map(Number);

  // Kural 4: 10. hane
  const oddSum  = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth   = ((oddSum * 7) - evenSum) % 10;
  if (tenth !== digits[9]) return false;

  // Kural 3: 11. hane
  const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (totalSum % 10 !== digits[10]) return false;

  return true;
}

/** TC Kimlik No'yu maskeler: ilk 7 haneyi gizler → "******* 4 5 6" */
export function maskTCKimlikNo(tc: string): string {
  if (!tc || tc.length < 4) return '***********';
  return '*'.repeat(7) + tc.slice(7);
}

// ── Telefon ────────────────────────────────────────
/** Türkiye cep numarası: 05XX XXX XX XX veya +905XX XXX XX XX */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+90|0)?5\d{9}$/.test(cleaned);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const local = cleaned.startsWith('90') ? cleaned.slice(2) : cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  if (local.length !== 10) return phone;
  return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
}

// ── Email ──────────────────────────────────────────
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Para Birimi ────────────────────────────────────
export function validatePositiveAmount(value: string): boolean {
  const num = parseFloat(value.replace(',', '.'));
  return !isNaN(num) && num > 0;
}

// ── Tarih ──────────────────────────────────────────
export function validateDateString(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Tahliye Taahhütnamesi tarih doğrulaması (TBK m.352).
 * Taahhüt tarihi, kira sözleşmesi başlangıç tarihinden SONRA olmalıdır.
 */
export function validateEvictionUndertakingDate(
  contractStartDate: string,
  undertakingDate: string,
): { valid: boolean; error?: string } {
  const start     = new Date(contractStartDate);
  const undertaking = new Date(undertakingDate);

  if (isNaN(start.getTime()))      return { valid: false, error: 'Geçersiz sözleşme tarihi.' };
  if (isNaN(undertaking.getTime())) return { valid: false, error: 'Geçersiz taahhütname tarihi.' };

  if (undertaking <= start) {
    return {
      valid: false,
      error:
        'Tahliye taahhütnamesi, kira sözleşmesinin başlangıç tarihinden sonraki bir tarihte imzalanmış olmalıdır (TBK m.352). Aksi hâlde geçersiz sayılabilir.',
    };
  }
  return { valid: true };
}

// ── Kira Artışı ────────────────────────────────────
/** Artış oranının 0-200 arasında olup olmadığını kontrol eder */
export function validateIncreaseRate(rate: string): boolean {
  const n = parseFloat(rate.replace(',', '.'));
  return !isNaN(n) && n >= 0 && n <= 200;
}

// ── Oda Sayısı ─────────────────────────────────────
/** Türkiye oda format: "1+0", "2+1", "3+1", "4+2" vb. */
export function validateRoomFormat(rooms: string): boolean {
  return /^\d+\+\d+$/.test(rooms.trim());
}
