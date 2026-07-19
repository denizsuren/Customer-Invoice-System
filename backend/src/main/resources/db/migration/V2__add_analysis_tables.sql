CREATE TABLE customer_stats (
    customer_id                BIGINT PRIMARY KEY REFERENCES customer (customer_id),
    total_invoices              INTEGER,
    late_payment_count          INTEGER,
    unpaid_count                INTEGER,
    avg_delay_days               NUMERIC(6,2),
    overuse_count                INTEGER,
    total_recharges              INTEGER,
    avg_recharge_amount          NUMERIC(8,2),
    avg_days_between_recharges   NUMERIC(6,2)
);

CREATE TABLE customer_risk_analysis (
    customer_id                   BIGINT PRIMARY KEY REFERENCES customer (customer_id),
    risk_score                    NUMERIC(5,2),
    behavior_category              VARCHAR(20),
    recommend_action               VARCHAR(40),
    suggested_upgrade_product_id   BIGINT REFERENCES product (product_id),
    calculated_at                  TIMESTAMP DEFAULT now(),

    CONSTRAINT chk_behavior_category CHECK (
        behavior_category IN ('guvenli', 'orta_risk', 'riskli', 'aktif', 'pasif') OR behavior_category IS NULL
    )
);