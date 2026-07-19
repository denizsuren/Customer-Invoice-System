/*
  COMPONENT: Modal

  Projedeki bütün modal pencerelerin ortak çerçevesidir.
  İçerik `children`, alt butonlar `footer` propuyla gelir.

  Davranışlar:
  - open false ise hiç render edilmez.
  - Escape tuşu modalı kapatır.
  - Karanlık arka plana tıklamak modalı kapatır.
  - Modalın kendi içine tıklamak kapatmaz.
  - Açıkken body scroll'u kilitlenir.

  TASARIM: customers.css -> `.modal-backdrop`, `.modal`, `.modal__header`, `.modal__footer`
*/

import { useEffect, useId } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function Modal({
  open,
  title,
  subtitle,
  children,
  footer,
  onClose,
  width = "560px",
}) {
  // Birden fazla modal componenti olsa bile aria-labelledby ID'si çakışmaz.
  const titleId = useId();
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);

    // Modal kapanınca veya component kaldırılınca event ve body classı temizlenir.
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section
        className="modal"
        style={{ maxWidth: width }}
        // Tıklamanın backdrop'a ulaşmasını engeller.
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          <button className="icon-button" onClick={onClose} aria-label={t("modal_close")}>
            ×
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
