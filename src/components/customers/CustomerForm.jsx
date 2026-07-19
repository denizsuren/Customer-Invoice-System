/*
  COMPONENT: CustomerForm

  Hem yeni müşteri ekleme hem de var olan müşteriyi güncelleme ekranında kullanılan ortak formdur.
  Formda yalnızca kullanıcının manuel girmesi gereken müşteri bilgileri bulunur.

  Not:
  Etiket/risk bilgisi bu formdan seçilmez. Risk etiketi backend analizleri sonrası atanır.
*/

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getProducts } from "../../services/productService.js";
import { TURKEY_CITIES } from "../../utils/turkeyCities.js";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";

const defaultValues = {
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  ageGroup: "",
  lineType: "Faturalı",
  city: "İstanbul",
  productId: "",
  packageName: "",
};

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  const [year, month, day] = String(value ?? "")
    .split("-")
    .map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function getAdultBirthDateMax() {
  const today = new Date();
  return formatDateInput(new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()));
}

function isUnder18(value) {
  const birthDate = parseDateInput(value);
  if (!birthDate) return false;

  const today = new Date();
  const eighteenthBirthday = new Date(
    birthDate.getFullYear() + 18,
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  return eighteenthBirthday > new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function calculateAge(value) {
  const birthDate = parseDateInput(value);
  if (!birthDate) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!birthdayPassedThisYear) age -= 1;

  return age;
}

function getAgeGroupFromBirthDate(value) {
  const age = calculateAge(value);

  if (age === null || age < 18) return "";
  if (age <= 25) return "18-25";
  if (age <= 35) return "26-35";
  if (age <= 45) return "36-45";
  if (age <= 55) return "46-55";

  return "56+";
}

function normalizeProductLineType(product) {
  const value = String(product?.subscriptionType ?? product?.category ?? "").toUpperCase();

  if (value.includes("PREPAID") || value.includes("FATURASIZ")) return "Faturasız";
  if (value.includes("POSTPAID") || value.includes("FATURALI")) return "Faturalı";

  return "";
}

export default function CustomerForm({
  initialValues = defaultValues,
  phoneLocked = false,
  submitLabel,
  submitting = false,
  onCancel,
  onSubmit,
}) {
  const { t, tv } = useLanguage();
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [products, setProducts] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const adultBirthDateMax = useMemo(() => getAdultBirthDateMax(), []);

  useEffect(() => {
    let active = true;

    getProducts()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch(() => {
        if (active) setProducts([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const matching = products.filter((product) => {
      const productLineType = normalizeProductLineType(product);
      return !productLineType || productLineType === form.lineType;
    });

    return matching.length ? matching : products;
  }, [form.lineType, products]);

  const updateField = (event) => {
    const { name, value } = event.target;

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: "" }));
    }

    setForm((current) => {
      if (name === "city") {
        return { ...current, city: value, regionId: "" };
      }

      if (name === "birthDate") {
        return { ...current, birthDate: value, ageGroup: getAgeGroupFromBirthDate(value) };
      }

      if (name === "lineType") {
        return { ...current, lineType: value, productId: "", packageName: "" };
      }

      if (name === "productId") {
        const selectedProduct = products.find(
          (product) => String(product.productId) === String(value),
        );
        const productLineType = normalizeProductLineType(selectedProduct);

        return {
          ...current,
          productId: value,
          packageName: selectedProduct?.name ?? "",
          lineType: productLineType || current.lineType,
        };
      }

      return { ...current, [name]: value };
    });
  };

  const validateForm = () => {
    const errors = {};
    const email = String(form.email ?? "").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const birthDate = String(form.birthDate ?? "").trim();

    if (!birthDate) {
      errors.birthDate = t("customers_validation_birthdate_required");
    } else if (!parseDateInput(birthDate)) {
      errors.birthDate = t("customers_validation_birthdate_invalid");
    } else if (isUnder18(birthDate)) {
      errors.birthDate = t("customers_validation_birthdate_underage");
    }

    if (!email) {
      errors.email = t("customers_validation_email_required");
    } else if (!emailPattern.test(email)) {
      errors.email = t("customers_validation_email_invalid");
    }

    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length) return;

    onSubmit({
      ...form,
      email: String(form.email ?? "").trim(),
      birthDate: String(form.birthDate ?? "").trim(),
      ageGroup: getAgeGroupFromBirthDate(form.birthDate),
    });
  };

  return (
    <form className="modal-form-grid" onSubmit={handleSubmit}>
      <FormField label={t("customers_form_name")}>
        <input
          required
          name="name"
          value={form.name}
          onChange={updateField}
          minLength={3}
          pattern="^[A-Za-zÇçĞğİıÖöŞşÜü]+(\s[A-Za-zÇçĞğİıÖöŞşÜü]+)+$"
          title="Ad ve soyadınızı girin (sadece harfler, aralarında boşluk olacak şekilde)"
        />
      </FormField>

      <FormField
        label={t("customers_form_phone")}
        hint={phoneLocked ? t("customers_form_phone_locked") : undefined}
      >
        <div className={phoneLocked ? "locked-input" : undefined}>
          {phoneLocked ? <span aria-hidden="true">🔒</span> : null}
          <input
            required
            name="phone"
            value={form.phone}
            onChange={updateField}
            disabled={phoneLocked}
            placeholder="+90 5__ ___ __ __"
            pattern="^(\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$"
            title="Geçerli bir telefon numarası girin (örn. +90 532 123 45 67)"
          />
        </div>
      </FormField>

      <FormField label={t("customers_form_email")} error={fieldErrors.email}>
        <input
          type="text"
          inputMode="email"
          aria-invalid={Boolean(fieldErrors.email)}
          name="email"
          value={form.email}
          onChange={updateField}
          placeholder="isim@ornek.com"
        />
      </FormField>

      <FormField label={t("customers_form_birthdate")} error={fieldErrors.birthDate}>
        <input
          required
          type="date"
          name="birthDate"
          value={form.birthDate ?? ""}
          onChange={updateField}
          max={adultBirthDateMax}
          aria-invalid={Boolean(fieldErrors.birthDate)}
        />
      </FormField>

      <FormField label={t("customers_form_age_range")}>
        <input
          readOnly
          value={
            form.ageGroup ||
            getAgeGroupFromBirthDate(form.birthDate) ||
            t("customers_form_age_range_placeholder")
          }
          className="readonly-input"
        />
      </FormField>

      <div className="form-two-columns">
        <FormField label={t("customers_form_line_type")}>
          <select name="lineType" value={form.lineType} onChange={updateField}>
            <option value="Faturalı">{tv("Faturalı")}</option>
            <option value="Faturasız">{tv("Faturasız")}</option>
          </select>
        </FormField>

        <FormField label={t("customers_form_city")}>
          <select name="city" value={form.city} onChange={updateField}>
            {TURKEY_CITIES.map((city) => (
              <option key={city} value={city}>
                {tv(city)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={t("customers_form_package")}>
        <select required name="productId" value={form.productId} onChange={updateField}>
          <option value="">{t("customers_form_package_placeholder")}</option>
          {filteredProducts.map((product) => (
            <option key={product.productId} value={product.productId}>
              {product.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="inline-actions">
        <Button onClick={onCancel} disabled={submitting}>
          {t("button_cancel")}
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? t("customers_form_saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
