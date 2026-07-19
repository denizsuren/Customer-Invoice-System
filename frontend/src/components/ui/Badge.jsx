/*
  COMPONENT: Badge

  Riskli, Güvenilir, Ödendi gibi küçük durum etiketlerini oluşturur.
  tone değeri CSS classına dönüşür.

  Örnek: tone="danger" -> `badge badge--danger`
  TASARIM: customers.css -> `.badge` ve `.badge--...`
*/

export default function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
