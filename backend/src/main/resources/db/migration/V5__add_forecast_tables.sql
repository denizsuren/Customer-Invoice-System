CREATE TABLE IF NOT EXISTS forecast_assumption (
    id           BIGSERIAL PRIMARY KEY,
    kategori     VARCHAR(30),
    metric_key   VARCHAR(80) UNIQUE,
    deger        VARCHAR(50),
    kaynak       TEXT,
    not_aciklama TEXT
);

CREATE TABLE IF NOT EXISTS revenue_forecast (
    year_offset                        INTEGER PRIMARY KEY,
    label                              VARCHAR(40),
    reel_bau_revenue                   NUMERIC(14,2),
    reel_with_recommendations_revenue  NUMERIC(14,2),
    nominal_bau_revenue                NUMERIC(14,2),
    reel_fark                          NUMERIC(14,2)
);