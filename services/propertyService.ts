import { supabase } from './supabase';
import type { Property, PropertyFormData, Contract } from '../types';

// Sözleşme alanları — list sorgusunda JOIN için minimal set
const CONTRACT_SELECT = `
  id, status, monthly_rent, payment_day, increase_basis, increase_rate,
  deposit_amount, start_date, end_date, currency, eviction_undertaking,
  eviction_undertaking_date, notes, created_at, updated_at,
  property_id, tenant_id, owner_id,
  tenants(id, full_name, phone)
`.trim();

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`*, contracts(${CONTRACT_SELECT})`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map(row => {
      const allContracts = ((row as Record<string, unknown>).contracts ?? []) as Contract[];
      const activeContract = allContracts.find(c => c.status === 'active');
      const { contracts: _c, ...rest } = row as Record<string, unknown>;
      return {
        ...rest,
        active_contract: activeContract ?? undefined,
        monthly_rent: activeContract?.monthly_rent ?? (rest.monthly_rent as number | undefined),
      } as unknown as Property;
    });
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, contracts(*, tenants(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(form: PropertyFormData): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');

    const payload = {
      owner_id:      user.id,
      title:         form.title,
      address:       form.address,
      city:          form.city,
      district:      form.district || null,
      property_type: form.property_type,
      area_sqm:      form.area_sqm ? parseFloat(form.area_sqm) : null,
      floor:         form.floor ? parseInt(form.floor, 10) : null,
      rooms:         form.rooms || null,
      features:      form.features,
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, form: Partial<PropertyFormData>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
  },
};
