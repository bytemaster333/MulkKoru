import { supabase } from './supabase';
import { validateEvictionUndertakingDate } from '../utils/validators';
import type { Contract, ContractFormData } from '../types';

export const contractService = {
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, properties(title, city), tenants(full_name, phone)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getByProperty(propertyId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, tenants(full_name, phone)')
      .eq('property_id', propertyId)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, properties(*), tenants(*), payments(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(form: ContractFormData): Promise<Contract> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');

    // Tahliye Taahhütnamesi tarih doğrulaması
    if (form.eviction_undertaking && form.eviction_undertaking_date) {
      const { valid, error: dateError } = validateEvictionUndertakingDate(
        form.start_date,
        form.eviction_undertaking_date,
      );
      if (!valid) throw new Error(dateError);
    }

    const payload = {
      owner_id:                    user.id,
      property_id:                 form.property_id,
      tenant_id:                   form.tenant_id,
      start_date:                  form.start_date,
      end_date:                    form.end_date || null,
      monthly_rent:                parseFloat(form.monthly_rent),
      deposit_amount:              form.deposit_amount ? parseFloat(form.deposit_amount) : null,
      payment_day:                 parseInt(form.payment_day, 10),
      increase_basis:              form.increase_basis,
      increase_rate:               form.increase_rate ? parseFloat(form.increase_rate) : null,
      eviction_undertaking:        form.eviction_undertaking,
      eviction_undertaking_date:   form.eviction_undertaking_date || null,
      notes:                       form.notes || null,
    };

    const { data, error } = await supabase
      .from('contracts')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    // İlk kira ödemesi oluştur
    await generatePayments(data.id, data.start_date, data.end_date, data.monthly_rent, data.payment_day);

    return data;
  },

  async updateStatus(id: string, status: Contract['status']): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) throw error;
  },
};

/** Sözleşme süresince tüm ödeme kayıtlarını oluşturur */
async function generatePayments(
  contractId: string,
  startDate: string,
  endDate: string | null,
  monthlyRent: number,
  paymentDay: number,
): Promise<void> {
  const start = new Date(startDate);
  const end   = endDate ? new Date(endDate) : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

  const payments: Array<{ contract_id: string; due_date: string; amount: number; status: string }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), paymentDay);

  // İlk ödeme günü başlangıç tarihinden önceyse bir ay ilerlet
  if (cursor < start) {
    cursor.setMonth(cursor.getMonth() + 1);
  }

  while (cursor <= end) {
    payments.push({
      contract_id: contractId,
      due_date:    cursor.toISOString().split('T')[0],
      amount:      monthlyRent,
      status:      'pending',
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (payments.length > 0) {
    const { error } = await supabase.from('payments').insert(payments);
    if (error) throw error;
  }
}
