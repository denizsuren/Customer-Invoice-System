/*
  COMPONENT: InvoiceForm

  Hem yeni fatura ekleme hem de var olan faturayı güncelleme ekranında kullanılan ortak formdur.
  Ekleme modunda müşteri arama/seçme alanı gösterir; güncelleme modunda müşteri sabittir (kilitli).
*/

import { useEffect, useState } from "react";
import { getCustomers } from "../../services/customerService.js";
import { getProducts } from "../../services/productService.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";

const defaultValues = {
  productId: "",
  paymentChannel: "online",
  invoiceAmount: "",
  dueAmount: "",
  overageAmount: "0",
  invoiceDate: "",
  dueDate: "",
  paymentDate: "",
};

export default function InvoiceForm({
  initialValues = defaultValues,
  lockedCustomer = null,
  submitLabel,
  submitting = false,
  onCancel,
  onSubmit,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [products, setProducts] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(lockedCustomer);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCustomerSearch = async () => {
    if (!customerQuery.trim()) return;
    setSearching(true);

    try {
      const result = await getCustomers({ page: 0, size: 5, search: customerQuery.trim() });
      setCustomerResults(result.items ?? []);
    } finally {
      setSearching(false);
    }
  };

  const pickCustomer = (customer) => {
    setSelectedCustomer({ customerId: customer.id, customerName: customer.name });
    setCustomerResults([]);
    setCustomerQuery("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedCustomer) return;
    onSubmit({ ...form, customerId: selectedCustomer.customerId });
  };

  return (
    <form className="modal-form-grid" onSubmit={handleSubmit}>
      <FormField label={t("invoices_form_customer")}>
        {lockedCustomer ? (
          <div className="locked-input">
            <span aria-hidden="true">🔒</span>
            <input
              disabled
              value={`${lockedCustomer.customerName} #${lockedCustomer.customerId}`}
            />
          </div>
        ) : selectedCustomer ? (
          <div className="locked-input">
            <input
              disabled
              value={`${selectedCustomer.customerName} #${selectedCustomer.customerId}`}
            />
            <button type="button" onClick={() => setSelectedCustomer(null)}>
              {t("invoices_form_change_customer")}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={customerQuery}
                onChange={(event) => setCustomerQuery(event.target.value)}
                placeholder={t("invoices_form_customer_search_placeholder")}
              />
              <Button type="button" onClick={handleCustomerSearch} disabled={searching}>
                {searching ? t("invoices_form_searching") : t("invoices_search_button")}
              </Button>
            </div>
            {customerResults.length ? (
              <div className="menu-list" style={{ marginTop: "8px" }}>
                {customerResults.map((customer) => (
                  <button type="button" key={customer.id} onClick={() => pickCustomer(customer)}>
                    {customer.name} #{customer.id}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </FormField>

      <FormField label={t("invoices_table_package")}>
        <select required name="productId" value={form.productId} onChange={updateField}>
          <option value="">{t("invoices_form_package_placeholder")}</option>
          {products.map((product) => (
            <option key={product.productId} value={product.productId}>
              {product.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="form-two-columns">
        <FormField label={t("invoices_form_payment_channel")}>
          <select name="paymentChannel" value={form.paymentChannel} onChange={updateField}>
            <option value="online">{t("invoices_payment_channel_online")}</option>
            <option value="branch">{t("invoices_payment_channel_branch")}</option>
            <option value="mobile">{t("invoices_payment_channel_mobile")}</option>
          </select>
        </FormField>

        <FormField label={t("invoices_form_invoice_amount")}>
          <input
            required
            type="number"
            step="0.01"
            name="invoiceAmount"
            value={form.invoiceAmount}
            onChange={updateField}
          />
        </FormField>
      </div>

      <div className="form-two-columns">
        <FormField label={t("invoices_form_due_amount")}>
          <input
            required
            type="number"
            step="0.01"
            name="dueAmount"
            value={form.dueAmount}
            onChange={updateField}
          />
        </FormField>

        <FormField label={t("invoices_form_overage_amount")}>
          <input
            type="number"
            step="0.01"
            name="overageAmount"
            value={form.overageAmount}
            onChange={updateField}
          />
        </FormField>
      </div>

      <div className="form-two-columns">
        <FormField label={t("invoices_form_invoice_date")}>
          <input
            required
            type="date"
            name="invoiceDate"
            value={form.invoiceDate}
            onChange={updateField}
          />
        </FormField>

        <FormField label={t("invoices_form_due_date")}>
          <input required type="date" name="dueDate" value={form.dueDate} onChange={updateField} />
        </FormField>
      </div>

      <FormField label={t("invoices_form_payment_date")}>
        <input type="date" name="paymentDate" value={form.paymentDate} onChange={updateField} />
      </FormField>

      <div className="inline-actions">
        <Button onClick={onCancel} disabled={submitting}>
          {t("button_cancel")}
        </Button>
        <Button variant="primary" type="submit" disabled={submitting || !selectedCustomer}>
          {submitting ? t("customers_form_saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
