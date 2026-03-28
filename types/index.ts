// ─────────────────────────────────────────────
//  MülkKoru — Shared TypeScript Interfaces
// ─────────────────────────────────────────────

// ── Auth ─────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// ── Property ─────────────────────────────────
export type PropertyType = 'apartment' | 'house' | 'commercial' | 'land';

export interface PropertyFeatures {
  parking: boolean;
  elevator: boolean;
  balcony: boolean;
  garden: boolean;
  furnished: boolean;
  internet: boolean;
  heating: 'central' | 'kombi' | 'soba' | 'none';
  floor_heating: boolean;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  address: string;
  city: string;
  district?: string;
  property_type: PropertyType;
  area_sqm?: number;
  floor?: number;
  rooms?: string; // e.g. '3+1'
  features?: Partial<PropertyFeatures>;
  created_at: string;
  updated_at: string;
  // Derived/joined
  active_contract?: Contract;
  monthly_rent?: number;
}

export interface PropertyFormData {
  title: string;
  address: string;
  city: string;
  district: string;
  property_type: PropertyType;
  area_sqm: string;
  floor: string;
  rooms: string;
  features: Partial<PropertyFeatures>;
}

// ── Tenant ────────────────────────────────────
export interface Tenant {
  id: string;
  owner_id: string;
  full_name: string;
  // KVKK: TC kimlik NO uygulamada şifreli tutulur, API'ye plain text gönderilmez
  tc_no_masked?: string;   // sadece son 4 hane görünür: ***1234
  phone?: string;
  email?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relation: string;
  };
  created_at: string;
  // Derived
  active_contract?: Contract;
}

export interface TenantFormData {
  full_name: string;
  tc_no: string;            // plain text — şifreleme service katmanında
  phone: string;
  email: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relation: string;
}

// ── Contract ──────────────────────────────────
export type ContractStatus = 'active' | 'expired' | 'terminated';
export type IncreaseBasis = 'TUFE' | 'FIXED' | 'AGREED';

export interface Contract {
  id: string;
  property_id: string;
  tenant_id: string;
  owner_id: string;
  start_date: string;
  end_date?: string;
  monthly_rent: number;
  currency: string;
  deposit_amount?: number;
  payment_day: number;
  increase_rate?: number;
  increase_basis: IncreaseBasis;
  status: ContractStatus;
  // Tahliye Taahhütnamesi (TBK m.352) — kullanıcının eklediği
  eviction_undertaking: boolean;
  eviction_undertaking_date?: string;   // imza tarihi
  ai_analysis?: ContractAIAnalysis;
  document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joins
  property?: Property;
  tenant?: Tenant;
}

export interface ContractFormData {
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  deposit_amount: string;
  payment_day: string;
  increase_basis: IncreaseBasis;
  increase_rate: string;
  eviction_undertaking: boolean;
  eviction_undertaking_date: string;
  notes: string;
}

// ── AI Analysis (Phase 2) ─────────────────────
export interface ContractRisk {
  clause: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  tbk_reference?: string;
}

export interface ContractAIAnalysis {
  risks: ContractRisk[];
  missing_clauses: string[];
  invalid_clauses: string[];
  deposit_compliance: boolean;
  eviction_undertaking_valid?: boolean;   // imza tarihi sözleşme sonrası mı?
  score: number;
  summary: string;
  analyzed_at: string;
}

// ── Payment ───────────────────────────────────
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export interface Payment {
  id: string;
  contract_id: string;
  due_date: string;
  amount: number;
  paid_date?: string;
  paid_amount?: number;
  status: PaymentStatus;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  // Joins
  contract?: Contract;
}

// ── Maintenance (Phase 3) ─────────────────────
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  contract_id?: string;
  tenant_id?: string;
  owner_id: string;
  title: string;
  description?: string;
  category?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  photos?: string[];
  resolution?: string;
  resolved_at?: string;
  created_at: string;
}

// ── Dashboard Stats ───────────────────────────
export interface DashboardStats {
  total_properties: number;
  active_contracts: number;
  monthly_income: number;
  overdue_payments: number;
  upcoming_payments_count: number;
  occupancy_rate: number;
}

// ── TÜFE Calculator (Phase 2) ─────────────────
export interface TUFEIncreaseResult {
  previous_rent: number;
  tufe_rate: number;
  max_legal_rate: number;
  max_new_rent: number;
  recommended_new_rent: number;
  is_compliant: boolean;
  legal_note: string;
}
