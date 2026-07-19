/*
  COMPONENT: StatusMessage

  Loading, bilgi veya hata mesajlarını tek tip kutuda gösterir.
  tone="danger" olduğunda ekran okuyuculara acil hata olarak `alert` rolü verir.

  action propuna "Tekrar dene" gibi bir buton verilebilir.
  TASARIM: customers.css -> `.status-message`, `.status-message--danger`
*/

function renderMessage(children) {
  if (typeof children !== "string" || !children.includes("\n")) {
    return <span>{children}</span>;
  }

  const [title, ...details] = children.split("\n").filter(Boolean);

  return (
    <span className="status-message__content">
      <strong>{title}</strong>
      <ul>
        {details.map((detail) => (
          <li key={detail}>{detail.replace(/^•\s*/, "")}</li>
        ))}
      </ul>
    </span>
  );
}

export default function StatusMessage({ tone = "info", children, action }) {
  return (
    <div
      className={`status-message status-message--${tone}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      {renderMessage(children)}
      {action}
    </div>
  );
}
