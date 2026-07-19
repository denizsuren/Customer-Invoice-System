/*
  COMPONENT: Topbar

  Sağ üstte admin bilgisini ve çıkış butonunu gösterir.
  Gerçek kullanıcı bilgileri backend/auth sisteminden geldiğinde
  name, role ve initials değerleri prop yapılabilir.

  TASARIM:
  layout.css -> `.topbar`, `.topbar__account`, `.avatar`
*/

import Button from "../ui/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { MenuIcon } from "./Icons.jsx";

// `onMenuToggle` verildiğinde mobil ekranda hamburger butonu görünür
// (buton CSS ile yalnızca dar ekranlarda gösterilir).
export default function Topbar({ onLogout, onMenuToggle }) {
  const { t } = useLanguage();

  return (
    <header className="topbar">
      {onMenuToggle ? (
        <button
          type="button"
          className="topbar__menu-button"
          onClick={onMenuToggle}
          aria-label={t("topbar_menu_toggle")}
        >
          <MenuIcon />
        </button>
      ) : null}

      <div className="topbar__account">
        <div className="avatar">AD</div>
        <div>
          <strong>Admin</strong>
          <span>{t("topbar_role")}</span>
        </div>
      </div>

      {/* Çıkış mantığı bu componentte değil, onLogout propunun geldiği üst katmandadır. */}
      <Button onClick={onLogout}>{t("topbar_logout")}</Button>
    </header>
  );
}
