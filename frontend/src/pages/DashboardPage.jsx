/*
  PAGE: DashboardPage

  Ana sayfanın bütün dashboard bölümlerini bir araya getirir.
  Backend çağrısı burada doğrudan yapılmaz; useDashboardData hook'u kullanılır.

  Veri akışı:
  dashboardService -> useDashboardData -> DashboardPage -> grafik/kart componentleri
*/

import { useState } from "react";
import CityRevenueBarChart from "../components/charts/CityRevenueBarChart.jsx";
import PackageDonutChart from "../components/charts/PackageDonutChart.jsx";
import RevenueLineChart from "../components/charts/RevenueLineChart.jsx";
import RecommendationCard from "../components/dashboard/RecommendationCard.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import useDashboardData from "../hooks/useDashboardData.js";

export default function DashboardPage() {
  // Arayüz metinlerini seçili dile göre döndürür.
  const { t, tv } = useLanguage();

  // Yalnızca önerilerin tamamını gösteren modalın açık/kapalı durumunu yönetir.
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);

  // Dashboard verisi, loading ve hata durumu hook'tan gelir.
  const { data, loading, error, reload } = useDashboardData();

  if (loading && !data) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <h1>{t("dashboard_title")}</h1>
          <p>{t("dashboard_loading_title")}</p>
        </div>
        <StatusMessage>{t("dashboard_loading")}</StatusMessage>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <h1>{t("dashboard_title")}</h1>
          <p>{t("dashboard_error_title")}</p>
        </div>
        <StatusMessage tone="danger" action={<Button onClick={reload}>{t("button_retry")}</Button>}>
          {tv(error)}
        </StatusMessage>
      </section>
    );
  }

  // API eksik alan döndürürse sayfanın tamamen çökmesini önleyen varsayılanlar.
  const stats = data?.stats ?? [];
  const revenuePoints = data?.revenuePoints ?? [];
  const packageDistribution = data?.packageDistribution ?? [];
  const cityRevenue = data?.cityRevenue ?? [];
  const recommendations = data?.recommendations ?? [];

  return (
    <section className="page-content">
      <div className="page-heading">
        <h1>{t("dashboard_title")}</h1>
        <p>{tv(data?.periodLabel) ?? t("dashboard_default_period")}</p>
      </div>

      {/* Önceden yüklenmiş veri varken yenileme hatası oluşursa içerik kaybolmadan mesaj gösterilir. */}
      {error ? (
        <StatusMessage tone="danger" action={<Button onClick={reload}>{t("button_retry")}</Button>}>
          {tv(error)}
        </StatusMessage>
      ) : null}

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={`${stat.label}-${index}`} {...stat} />
        ))}
      </div>

      <div className="dashboard-row">
        <RevenueLineChart data={revenuePoints} />
        <PackageDonutChart data={packageDistribution} totalLines={data?.activeLineCount ?? 0} />
      </div>

      <div className="dashboard-row">
        <CityRevenueBarChart data={cityRevenue} />
        <RecommendationCard
          recommendations={recommendations}
          onOpenAll={() => setRecommendationsOpen(true)}
        />
      </div>

      <Modal
        open={recommendationsOpen}
        title={t("dashboard_recommendation_modal_title")}
        subtitle={t("dashboard_recommendation_modal_subtitle")}
        onClose={() => setRecommendationsOpen(false)}
        width="660px"
        footer={
          <Button variant="primary" onClick={() => setRecommendationsOpen(false)}>
            {t("button_close")}
          </Button>
        }
      >
        <div className="recommendation-list">
          {recommendations.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className={`recommendation-item recommendation-item--${item.tone}`}
            >
              <div>
                <strong>{tv(item.title)}</strong>
                <p>{tv(item.description)}</p>
              </div>
            </article>
          ))}
        </div>
      </Modal>
    </section>
  );
}
