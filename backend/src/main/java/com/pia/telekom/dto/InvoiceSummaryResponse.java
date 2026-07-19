package com.pia.telekom.dto;

import java.math.BigDecimal;

/*
  Faturalar sayfasının üstündeki 4 özet kart için tek seferde dönen cevap.
  - expectedAnnualRevenue: son 5 yılın yıllık ciro ortalaması
  - mobileChannelRate: ödeme kanalı tercihi mobil olan müşteri yüzdesi (0-100)
  - mobileTopRegion: mobil tercih eden müşterinin en yoğun olduğu bölge adı
  - overdueCount: son ödeme tarihini 3+ gün geçmiş, ödenmemiş fatura adedi
  - overageCount / averageOverageAmount: son 30 günde paket aşımı yapan fatura
    adedi ve ortalama aşım tutarı
*/
public record InvoiceSummaryResponse(
        BigDecimal expectedAnnualRevenue,
        double mobileChannelRate,
        String mobileTopRegion,
        long overdueCount,
        long overageCount,
        BigDecimal averageOverageAmount
) {
}
