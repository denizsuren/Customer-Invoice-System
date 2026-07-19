/*
  COMPONENT: Sidebar

  Uygulamanın sol menüsünü ve sayfa linklerini oluşturur.
  Yeni bir menü eklemek için navItems array'ine yeni obje eklenir.

  TASARIM:
  layout.css -> `.sidebar`, `.sidebar-link`, `.sidebar-link--active`, `.brand`
*/

import { NavLink } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { ChartIcon, GearIcon, HomeIcon, InvoiceIcon, PinIcon, UsersIcon } from "./Icons.jsx";

// to: gidilecek route, key: t() sözlük anahtarı, icon: kullanılacak SVG componenti.
const navItems = [
  { to: "/", key: "nav_home", icon: HomeIcon, end: true },
  { to: "/customers", key: "nav_customers", icon: UsersIcon },
  { to: "/invoices", key: "nav_invoices", icon: InvoiceIcon },
  { to: "/analytics", key: "nav_analytics", icon: ChartIcon },
  { to: "/regional", key: "nav_regional", icon: PinIcon },
];

// `open` ve `onNavigate`, mobil ekranda açılıp kapanan menü çekmecesi için kullanılır.
// Masaüstünde bu prop'ların hiçbir etkisi yoktur (CSS sadece mobil breakpointte devreye girer).
export default function Sidebar({ open = false, onNavigate }) {
  const { t } = useLanguage();

  return (
    <aside className={`sidebar${open ? " sidebar--open" : ""}`}>
      <div className="brand">
        <strong>PiA</strong>
        <span className="brand__divider" />
        <span>
          {t("brand_sub_line_1")}
          <br />
          {t("brand_sub_line_2")}
        </span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            // `end`, ana sayfa linkinin diğer tüm route'larda aktif görünmesini engeller.
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link--active" : ""}`}
          >
            <Icon />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      {/* CSS'teki margin-top: auto sayesinde Ayarlar en alta gider. */}
      <NavLink
        to="/settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          `sidebar-link sidebar-link--settings${isActive ? " sidebar-link--active" : ""}`
        }
      >
        <GearIcon />
        <span>{t("nav_settings")}</span>
      </NavLink>
    </aside>
  );
}
