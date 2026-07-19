-- ============================================
-- A) SEED / İŞLEMSEL TABLOLAR
-- ============================================

CREATE TABLE region (
    region_id         BIGSERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    city_type         VARCHAR(20)  NOT NULL,   -- metro / mid / rural
    population_weight NUMERIC(4,2),

    CONSTRAINT chk_region_city_type CHECK (city_type IN ('metro', 'mid', 'rural'))
);

CREATE TABLE product (
    product_id        BIGSERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    category          VARCHAR(30)  NOT NULL,   -- data/individual/voice/family/addon
    monthly_fee       NUMERIC(8,2) NOT NULL,
    data_limit_gb     INTEGER,
    voice_limit_min   INTEGER,
    tier_level        VARCHAR(20),             -- basic/standard/premium/addon
    subscription_type VARCHAR(20)  NOT NULL,   -- faturali/faturasiz

    CONSTRAINT chk_product_category CHECK (category IN ('data', 'individual', 'voice', 'family', 'addon')),
    CONSTRAINT chk_product_tier CHECK (tier_level IN ('basic', 'standard', 'premium', 'addon')),
    CONSTRAINT chk_product_subscription_type CHECK (subscription_type IN ('faturali', 'faturasiz'))
);

CREATE TABLE customer (
    customer_id                BIGSERIAL PRIMARY KEY,
    name                       VARCHAR(100) NOT NULL,
    surname                    VARCHAR(100) NOT NULL,
    birthdate                  DATE,
    address                    TEXT,
    email                      VARCHAR(150) UNIQUE,
    phone                      VARCHAR(20)  UNIQUE,
    region_id                  BIGINT NOT NULL,
    age_group                  VARCHAR(20),
    payment_channel_preference VARCHAR(20),    -- online/branch/mobile
    has_autopay                BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_customer_region FOREIGN KEY (region_id) REFERENCES region (region_id),
    CONSTRAINT chk_customer_payment_channel CHECK (
        payment_channel_preference IN ('online', 'branch', 'mobile') OR payment_channel_preference IS NULL
    )
);

CREATE INDEX idx_customer_region_id ON customer (region_id);

CREATE TABLE subscription (
    subscription_id BIGSERIAL PRIMARY KEY,
    customer_id      BIGINT NOT NULL UNIQUE,   -- 1-1: müşteri başına tek abonelik
    product_id       BIGINT NOT NULL,
    start_date       DATE,
    status           VARCHAR(20),

    CONSTRAINT fk_subscription_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
    CONSTRAINT fk_subscription_product FOREIGN KEY (product_id) REFERENCES product (product_id)
);

CREATE INDEX idx_subscription_product_id ON subscription (product_id);

CREATE TABLE invoice (
    invoice_id      BIGSERIAL PRIMARY KEY,
    customer_id     BIGINT NOT NULL,
    product_id      BIGINT,
    payment_channel VARCHAR(20),
    invoice_amount  NUMERIC(10,2),
    due_amount      NUMERIC(10,2),
    overage_amount  NUMERIC(10,2),
    invoice_date    DATE,
    due_date        DATE,
    payment_date    DATE NULL,                  -- boşsa ödenmemiş demektir

    CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
    CONSTRAINT fk_invoice_product FOREIGN KEY (product_id) REFERENCES product (product_id)
);

CREATE INDEX idx_invoice_customer_id ON invoice (customer_id);
CREATE INDEX idx_invoice_product_id ON invoice (product_id);
CREATE INDEX idx_invoice_due_date ON invoice (due_date);

CREATE TABLE recharge (
    recharge_id       BIGSERIAL PRIMARY KEY,
    customer_id       BIGINT NOT NULL,
    recharge_channel  VARCHAR(30),
    recharge_amount   NUMERIC(10,2),
    recharge_date     DATE,
    gozlem_disi_kayit BOOLEAN NOT NULL DEFAULT FALSE,   -- Temmuz sızıntısı flag'i

    CONSTRAINT fk_recharge_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id)
);

CREATE INDEX idx_recharge_customer_id ON recharge (customer_id);

CREATE TABLE collection_action (
    action_id   BIGSERIAL PRIMARY KEY,
    invoice_id  BIGINT NOT NULL,
    action_type VARCHAR(30) NOT NULL,   -- SMS / PAYMENT_EXTENSION / LINE_RESTRICTION
    action_date DATE,

    CONSTRAINT fk_collection_action_invoice FOREIGN KEY (invoice_id) REFERENCES invoice (invoice_id),
    CONSTRAINT chk_action_type CHECK (action_type IN ('SMS', 'PAYMENT_EXTENSION', 'LINE_RESTRICTION'))
);

CREATE INDEX idx_collection_action_invoice_id ON collection_action (invoice_id);

-- ============================================
-- B) HAM AGREGASYON (seed edilebilir)
-- ============================================

CREATE TABLE customer_stats (
    customer_id                BIGINT PRIMARY KEY REFERENCES customer (customer_id),
    total_invoices             INTEGER,
    late_payment_count         INTEGER,
    unpaid_count               INTEGER,
    avg_delay_days             NUMERIC(6,2),   -- SADECE geç ödenenlerin ortalaması
    overuse_count              INTEGER,
    total_recharges            INTEGER,
    avg_recharge_amount        NUMERIC(8,2),
    avg_days_between_recharges NUMERIC(6,2)
);

-- ============================================
-- C) ANALİZ ÇIKTISI — seed'DEN DEĞİL, backend servisi doldurur
-- ============================================

CREATE TABLE customer_risk_analysis (
    customer_id                  BIGINT PRIMARY KEY REFERENCES customer (customer_id),
    risk_score                   NUMERIC(5,2),
    behavior_category            VARCHAR(20),   -- guvenli/orta_risk/riskli/aktif/pasif
    recommend_action             VARCHAR(40),
    suggested_upgrade_product_id BIGINT REFERENCES product (product_id),
    calculated_at                TIMESTAMP DEFAULT now(),

    CONSTRAINT chk_behavior_category CHECK (
        behavior_category IN ('guvenli', 'orta_risk', 'riskli', 'aktif', 'pasif') OR behavior_category IS NULL
    )
);

-- ============================================
-- D) FORECAST / RAPOR TABLOLARI
-- ============================================

CREATE TABLE sector_benchmark (
    id                                  BIGSERIAL PRIMARY KEY,
    yil                                 INTEGER,
    ceyrek                              VARCHAR(5),   -- 'YIL', 'Q1'...'Q4'
    sektor_geliri_milyar_tl             NUMERIC(10,2),
    ceyreklik_buyume_yuzde              NUMERIC(5,2),
    veri_tipi                           VARCHAR(20),  -- gercek/turetilmis/tahmini
    mobil_pay_yuzde_varsayim            NUMERIC(5,2),
    sabit_genisbant_pay_yuzde_varsayim  NUMERIC(5,2),
    sabit_ses_pay_yuzde_varsayim        NUMERIC(5,2),
    kaynak                              TEXT
);

CREATE TABLE forecast_assumption (
    id           BIGSERIAL PRIMARY KEY,
    kategori     VARCHAR(30),         -- sektor_buyume / benimseme_orani / gelir_formulu / sirket_varsayim
    metric_key   VARCHAR(80) UNIQUE,
    deger        VARCHAR(50),
    kaynak       TEXT,
    not_aciklama TEXT
);

CREATE TABLE revenue_forecast (
    year_offset                        INTEGER PRIMARY KEY,   -- 0, 1, 2
    label                              VARCHAR(40),
    reel_bau_revenue                   NUMERIC(14,2),
    reel_with_recommendations_revenue  NUMERIC(14,2),
    nominal_bau_revenue                NUMERIC(14,2),
    reel_fark                          NUMERIC(14,2)
);