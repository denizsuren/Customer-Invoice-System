/*
  DOSYA: Icons.jsx

  Sidebar'da kullanılan SVG ikonları burada tutulur.
  Bütün ikonların ortak boyut/çizgi ayarını değiştirmek için commonProps objesine bak.
  Tek bir ikonun şeklini değiştirmek için ilgili componentteki path/circle değerleri düzenlenir.
*/

const commonProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  // currentColor sayesinde ikon rengi CSS'teki `color` değerini takip eder.
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  // İkonlar dekoratif olduğu için ekran okuyucu tarafından okunmaz.
  "aria-hidden": true,
};

export function HomeIcon() {
  return (
    <svg {...commonProps}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg {...commonProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function InvoiceIcon() {
  return (
    <svg {...commonProps}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg {...commonProps}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function CloseMenuIcon() {
  return (
    <svg {...commonProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.3.3.5.7.6 1 .1.4.1.8.1 1.1h.1v4h-.1a1.7 1.7 0 0 0-.7-.1Z" />
    </svg>
  );
}
