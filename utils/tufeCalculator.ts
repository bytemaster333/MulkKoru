// MülkKoru — TÜFE Bazlı Kira Artış Hesaplayıcı
// Yasal Dayanak: TBK m.344 (6098 sayılı Kanun)
// Geçerlilik: 01.07.2023 sonrası konut kira artışları

import type { TUFEIncreaseResult } from '../types';

/**
 * TÜFE 12 aylık ortalama bazlı maksimum yasal kira artışını hesaplar.
 *
 * @param currentRent      Mevcut aylık kira (TL)
 * @param tufe12MonthAvg   TÜİK tarafından açıklanan 12 aylık TÜFE ortalaması (yüzde, örn: 48.72)
 * @param isResidential    Konut kirası mı? (true = konut, false = ticari)
 * @param agreedRate       Sözleşmede belirlenen artış oranı (opsiyonel, yüzde)
 */
export function calculateTUFEIncrease(
  currentRent: number,
  tufe12MonthAvg: number,
  isResidential = true,
  agreedRate?: number,
): TUFEIncreaseResult {
  // Yasal maksimum oran: konut için TÜFE oranıdır
  const maxLegalRate = tufe12MonthAvg;

  // Uygulanacak oran: sözleşmede düşük oran belirlenmişse o geçerli,
  // yüksek oran belirlenmişse TÜFE tavanı aşılamaz (konut)
  let appliedRate: number;
  if (isResidential) {
    appliedRate =
      agreedRate !== undefined
        ? Math.min(agreedRate, maxLegalRate) // TÜFE'yi geçemez
        : maxLegalRate;
  } else {
    // Ticari kirada taraflar serbestçe belirler
    appliedRate = agreedRate !== undefined ? agreedRate : maxLegalRate;
  }

  const maxNewRent           = currentRent * (1 + maxLegalRate / 100);
  const recommendedNewRent   = currentRent * (1 + appliedRate / 100);
  const isCompliant          =
    agreedRate === undefined || agreedRate <= maxLegalRate || !isResidential;

  const legalNote = buildLegalNote(isResidential, agreedRate, maxLegalRate, isCompliant);

  return {
    previous_rent:        currentRent,
    tufe_rate:            tufe12MonthAvg,
    max_legal_rate:       maxLegalRate,
    max_new_rent:         Math.round(maxNewRent * 100) / 100,
    recommended_new_rent: Math.round(recommendedNewRent * 100) / 100,
    is_compliant:         isCompliant,
    legal_note:           legalNote,
  };
}

function buildLegalNote(
  isResidential: boolean,
  agreedRate: number | undefined,
  maxLegalRate: number,
  isCompliant: boolean,
): string {
  if (!isResidential) {
    return 'Ticari kira sözleşmelerinde artış oranı taraflarca serbestçe belirlenir (TBK m.344/4).';
  }
  if (!isCompliant) {
    return (
      `⚠️ Dikkat: Sözleşmede belirlenen %${agreedRate?.toFixed(2)} artış oranı, ` +
      `yasal TÜFE sınırı %${maxLegalRate.toFixed(2)}'yi aşmaktadır. ` +
      `Aşan kısım geçersizdir; mahkeme TÜFE oranına indirgeyecektir (TBK m.344/1).`
    );
  }
  return (
    `Artış oranı TBK m.344/1 uyarınca TÜFE 12 aylık ortalaması (%${maxLegalRate.toFixed(2)}) ` +
    `ile sınırlandırılmıştır. Sözleşme hükmü yasal sınır içindedir.`
  );
}

/**
 * Yıllık kira artışının yeni aylık ve yıllık toplam kira gelirini döndürür.
 */
export function projectAnnualIncome(
  currentRent: number,
  tufe12MonthAvg: number,
  months = 12,
): { new_monthly: number; annual_total: number; increase_amount: number } {
  const result     = calculateTUFEIncrease(currentRent, tufe12MonthAvg);
  const newMonthly = result.recommended_new_rent;
  return {
    new_monthly:     newMonthly,
    annual_total:    Math.round(newMonthly * months * 100) / 100,
    increase_amount: Math.round((newMonthly - currentRent) * 100) / 100,
  };
}

/**
 * Depozito uyumluluğunu kontrol eder (TBK m.342).
 * @param depositAmount  Alınan depozito tutarı
 * @param monthlyRent    Aylık kira
 */
export function validateDepositAmount(
  depositAmount: number,
  monthlyRent: number,
): { compliant: boolean; maxAllowed: number; excess: number } {
  const maxAllowed = monthlyRent * 3;
  const excess     = Math.max(0, depositAmount - maxAllowed);
  return {
    compliant:  depositAmount <= maxAllowed,
    maxAllowed: Math.round(maxAllowed * 100) / 100,
    excess:     Math.round(excess * 100) / 100,
  };
}
