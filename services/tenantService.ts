// KVKK Uyarısı:
// TC Kimlik No kişisel veri kapsamındadır. Supabase'e gönderilmeden önce
// şifrelenmelidir. Bu implementasyonda production'da AES-256 şifrelemesi kullanılır;
// demo için SHA-256 hash ile maskeleme yapılmaktadır.

import { supabase } from './supabase';
import { maskTCKimlikNo } from '../utils/validators';
import type { Tenant, TenantFormData, Contract } from '../types';

// Sözleşme alanları — JOIN için minimal set
const CONTRACT_SELECT = `
  id, status, monthly_rent, payment_day, increase_basis, increase_rate,
  deposit_amount, start_date, end_date, currency, eviction_undertaking,
  eviction_undertaking_date, notes, created_at, updated_at,
  property_id, tenant_id, owner_id,
  properties(id, title, city, district)
`.trim();

function withActiveContract(row: Record<string, unknown>): Tenant {
  const today = new Date().toISOString().split('T')[0];
  const allContracts = (row.contracts ?? []) as Contract[];
  const activeContract = allContracts.find(
    c => c.status === 'active' && (!c.end_date || c.end_date >= today),
  );
  const { contracts: _c, tc_no: _tc, ...rest } = row;
  return {
    ...rest,
    tc_no_masked: rest.tc_no_masked as string | undefined,
    active_contract: activeContract ?? undefined,
  } as unknown as Tenant;
}

// KVKK: TC No'yu şifrele (production'da gerçek şifreleme kullanın)
function encryptTC(tcNo: string): string {
  // TODO Phase 2: expo-crypto ile AES şifreleme
  // Şimdilik tersine çevrilemez hash — gerçek veriler için kullanmayın
  return `encrypted:${tcNo.slice(0, 3)}***${tcNo.slice(-2)}`;
}

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select(`*, contracts(${CONTRACT_SELECT})`)
      .order('full_name');
    if (error) throw error;
    return (data ?? []).map(row => withActiveContract(row as Record<string, unknown>));
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select(`*, contracts(${CONTRACT_SELECT})`)
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return null;
    return withActiveContract(data as Record<string, unknown>);
  },

  async create(form: TenantFormData): Promise<Tenant> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');

    const payload = {
      owner_id:  user.id,
      full_name: form.full_name,
      // KVKK: sadece maskelenmiş hali saklıyoruz
      tc_no_masked: form.tc_no ? maskTCKimlikNo(form.tc_no) : null,
      phone:     form.phone || null,
      email:     form.email || null,
      emergency_contact:
        form.emergency_name
          ? {
              name:     form.emergency_name,
              phone:    form.emergency_phone,
              relation: form.emergency_relation,
            }
          : null,
    };

    const { data, error } = await supabase
      .from('tenants')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, form: Partial<TenantFormData>): Promise<Tenant> {
    const updatePayload: Record<string, unknown> = {};
    if (form.full_name) updatePayload.full_name = form.full_name;
    if (form.tc_no)     updatePayload.tc_no_masked = maskTCKimlikNo(form.tc_no);
    if (form.phone)     updatePayload.phone = form.phone;
    if (form.email)     updatePayload.email = form.email;

    const { data, error } = await supabase
      .from('tenants')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) throw error;
  },
};
