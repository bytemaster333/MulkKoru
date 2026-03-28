import { supabase } from './supabase';
import type { Property, PropertyFormData } from '../types';

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
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
