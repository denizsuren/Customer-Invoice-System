/*
  COMPONENT: StatCard

  Dashboard'un üst kısmındaki tek bir özet kartı oluşturur.
  label, value, change ve tone değerleri backend dashboard cevabından gelir.

  TASARIM:
  dashboard.css -> `.stat-card` ve `.stat-card--warning/.stat-card--danger`
*/

import { useLanguage } from "../../context/LanguageContext.jsx";

export default function StatCard({ label, value, change, tone = "default" }) {
  const { tv } = useLanguage();

  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span>{tv(label)}</span>
      <strong>{value}</strong>
      {change ? <small>{tv(change)}</small> : null}
    </article>
  );
}
