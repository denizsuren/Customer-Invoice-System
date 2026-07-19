/*
  COMPONENT: Button

  Projedeki bütün standart butonların ortak componentidir.
  variant propuna göre renk classı değişir; diğer HTML button propları
  `...props` ile gerçek butona aktarılır.

  TASARIM: ui.css -> `.button`, `.button--primary`, `.button--danger` vb.
*/

export default function Button({
  children,
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button type={type} className={`button button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
