import { supabase } from './supabase';
import type { Payment, DashboardStats } from '../types';

export const paymentService = {
  async getUpcoming(days = 30): Promise<Payment[]> {
    const today  = new Date().toISOString().split('T')[0];
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureStr = future.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payments')
      .select('*, contracts(*, properties(title, city), tenants(full_name))')
      .gte('due_date', today)
      .lte('due_date', futureStr)
      .eq('status', 'pending')
      .order('due_date');
    if (error) throw error;
    return data ?? [];
  },

  async getOverdue(): Promise<Payment[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('payments')
      .select('*, contracts(*, properties(title, city), tenants(full_name))')
      .lt('due_date', today)
      .in('status', ['pending', 'partial'])
      .order('due_date');
    if (error) throw error;
    // Otomatik overdue işaretle
    const ids = (data ?? []).map(p => p.id);
    if (ids.length > 0) {
      await supabase.from('payments').update({ status: 'overdue' }).in('id', ids);
    }
    return (data ?? []).map(p => ({ ...p, status: 'overdue' as const }));
  },

  async getByMonth(year: number, month: number): Promise<Payment[]> {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to   = new Date(year, month, 0).toISOString().split('T')[0]; // last day
    const { data, error } = await supabase
      .from('payments')
      .select('*, contracts(property_id, properties(title))')
      .gte('due_date', from)
      .lte('due_date', to)
      .order('due_date');
    if (error) throw error;
    return data ?? [];
  },

  async markAsPaid(id: string, paidAmount?: number): Promise<void> {
    const { data: payment } = await supabase
      .from('payments')
      .select('amount')
      .eq('id', id)
      .single();

    const amount    = paidAmount ?? payment?.amount ?? 0;
    const fullAmount = payment?.amount ?? 0;
    const status    = amount >= fullAmount ? 'paid' : 'partial';

    const { error } = await supabase.from('payments').update({
      status,
      paid_date:   new Date().toISOString().split('T')[0],
      paid_amount: amount,
    }).eq('id', id);
    if (error) throw error;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');

    const [
      { count: totalProperties },
      { count: activeContracts },
      { data: activeContractData },
      { count: overdueCount },
      upcomingPayments,
    ] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'active'),
      supabase.from('contracts').select('monthly_rent').eq('owner_id', user.id).eq('status', 'active'),
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
      paymentService.getUpcoming(30),
    ]);

    const monthlyIncome  = (activeContractData ?? []).reduce((sum, c) => sum + (c.monthly_rent ?? 0), 0);
    const occupancyRate  = totalProperties ? Math.round(((activeContracts ?? 0) / (totalProperties ?? 1)) * 100) : 0;

    return {
      total_properties:         totalProperties ?? 0,
      active_contracts:         activeContracts ?? 0,
      monthly_income:           monthlyIncome,
      overdue_payments:         overdueCount ?? 0,
      upcoming_payments_count:  upcomingPayments.length,
      occupancy_rate:           occupancyRate,
    };
  },
};
