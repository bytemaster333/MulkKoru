-- ═══════════════════════════════════════════════════════════
--  MülkKoru — Supabase Veritabanı Şeması
--  Çalıştırma: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

-- Mülkler
CREATE TABLE IF NOT EXISTS properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  district      TEXT,
  property_type TEXT NOT NULL DEFAULT 'apartment'
                  CHECK (property_type IN ('apartment','house','commercial','land')),
  area_sqm      NUMERIC(8,2),
  floor         INTEGER,
  rooms         TEXT,
  features      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kiracılar
CREATE TABLE IF NOT EXISTS tenants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT NOT NULL,
  -- KVKK: TC No saklanmaz; maskelenmiş hali tutulur
  tc_no_masked     TEXT,
  phone            TEXT,
  email            TEXT,
  emergency_contact JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kira Sözleşmeleri
CREATE TABLE IF NOT EXISTS contracts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id              UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id                UUID REFERENCES tenants(id) ON DELETE SET NULL,
  owner_id                 UUID NOT NULL REFERENCES auth.users(id),
  start_date               DATE NOT NULL,
  end_date                 DATE,
  monthly_rent             NUMERIC(12,2) NOT NULL CHECK (monthly_rent > 0),
  currency                 TEXT NOT NULL DEFAULT 'TRY',
  deposit_amount           NUMERIC(12,2),
  payment_day              INTEGER NOT NULL DEFAULT 1 CHECK (payment_day BETWEEN 1 AND 28),
  increase_rate            NUMERIC(5,2),
  increase_basis           TEXT NOT NULL DEFAULT 'TUFE'
                             CHECK (increase_basis IN ('TUFE','FIXED','AGREED')),
  status                   TEXT NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active','expired','terminated')),
  -- Tahliye Taahhütnamesi (TBK m.352)
  eviction_undertaking      BOOLEAN NOT NULL DEFAULT FALSE,
  eviction_undertaking_date DATE,           -- imza tarihi; sözleşmeden SONRA olmalıdır
  -- AI Analizi (Faz 2)
  ai_analysis              JSONB,
  document_url             TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ödeme Kayıtları
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  due_date    DATE NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_date   DATE,
  paid_amount NUMERIC(12,2),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','paid','partial','overdue')),
  receipt_url TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Arıza/Bakım Talepleri (Faz 3 için hazır)
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  tenant_id   UUID REFERENCES tenants(id) ON DELETE SET NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  priority    TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','in_progress','resolved','closed')),
  photos      TEXT[],
  resolution  TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════

ALTER TABLE properties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "properties: owner access" ON properties
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Tenants policies
CREATE POLICY "tenants: owner access" ON tenants
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Contracts policies
CREATE POLICY "contracts: owner access" ON contracts
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Payments policies (owner'ın sözleşmeleriyle ilişkili)
CREATE POLICY "payments: owner access" ON payments
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = payments.contract_id
        AND c.owner_id = auth.uid()
    )
  );

-- Maintenance policies
CREATE POLICY "maintenance: owner access" ON maintenance_requests
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ═══════════════════════════════════════════════════
--  INDEXLER
-- ═══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_properties_owner    ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner       ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_owner     ON contracts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property  ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract   ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_due_date   ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_requests(property_id);

-- ═══════════════════════════════════════════════════
--  TRIGGER: updated_at otomatik güncelle
-- ═══════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
