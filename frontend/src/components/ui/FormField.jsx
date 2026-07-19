/*
  COMPONENT: FormField

  Form başlığı, input/select ve varsa yardım metnini ortak düzende gösterir.
  Gerçek input veya select `children` olarak bu componentin içine verilir.

  TASARIM: customers.css -> `.form-field`, `.form-field small`
*/

export default function FormField({ label, hint, error, children }) {
  return (
    <label className={`form-field${error ? " form-field--error" : ""}`}>
      <span>{label}</span>
      {children}
      {error ? (
        <small className="form-error-text">{error}</small>
      ) : hint ? (
        <small>{hint}</small>
      ) : null}
    </label>
  );
}
