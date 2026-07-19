/*
  PAGE: RegionalPage

  Bölgesel ekranının sayfa seviyesindeki merkezidir.
  Veriyi useRegionalData hook'undan alır ve grafik componentlerine dağıtır.

  Veri akışı:
  regionalService -> useRegionalData -> RegionalPage -> HorizontalBarChart
*/

import HorizontalBarChart from "../components/charts/HorizontalBarChart.jsx";
import TurkeyMap from "../components/regional/TurkeyMap.jsx";
import Button from "../components/ui/Button.jsx";
import StatusMessage from "../components/ui/StatusMessage.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import useRegionalData from "../hooks/useRegionalData.js";

export default function RegionalPage() {
  const { data, loading, error, reload } = useRegionalData();
  const { language, t, tv } = useLanguage();

  if (loading && !data) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <h1>{t("regional_title")}</h1>
          <p>{t("regional_subtitle")}</p>
        </div>
        <StatusMessage>{t("regional_loading")}</StatusMessage>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="page-content">
        <div className="page-heading">
          <h1>{t("regional_title")}</h1>
          <p>{t("regional_error_title")}</p>
        </div>
        <StatusMessage tone="danger" action={<Button onClick={reload}>{t("button_retry")}</Button>}>
          {tv(error)}
        </StatusMessage>
      </section>
    );
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <h1>{t("regional_title")}</h1>
        <p>{t("regional_subtitle")}</p>
      </div>

      {error ? (
        <StatusMessage tone="danger" action={<Button onClick={reload}>{t("button_retry")}</Button>}>
          {tv(error)}
        </StatusMessage>
      ) : null}

      <TurkeyMap items={data?.mapItems ?? []} />

      <div className="dashboard-row dashboard-row--even">
        <HorizontalBarChart
          title={t("regional_city_revenue_title")}
          subtitle={data?.cityRevenue?.subtitle}
          data={data?.cityRevenue?.items ?? []}
          unit={data?.cityRevenue?.unit}
          color="accent"
        />

        <HorizontalBarChart
          title={t("regional_mobile_payment_title")}
          subtitle={data?.mobilePayments?.subtitle}
          data={data?.mobilePayments?.items ?? []}
          unit={data?.mobilePayments?.unit}
          color="blue"
          formatValue={(value) => value.toLocaleString(language === "en" ? "en-US" : "tr-TR")}
        />
      </div>
    </section>
  );
}
