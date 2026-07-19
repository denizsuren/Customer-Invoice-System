/*
  COMPONENT: CustomerDetailModal

  Müşteri detay içeriğini Modal componenti içinde gösterir.
  Modal açıldığında yalnızca seçilen müşteri için gerçek fatura/abonelik verisi çekilir;
  böylece tabloda hızlı listeleme yapılırken detayda 6 aylık gerçek fatura geçmişi gösterilir.
*/

import { useEffect, useMemo, useState } from "react";
import { getCustomerExtraData } from "../../services/customerService.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import CustomerDetail from "./CustomerDetail.jsx";

const emptyDetailData = { customerId: null, invoices: [], subscription: null, recharges: [] };

export default function CustomerDetailModal({ customer, onClose, onEdit, onDelete }) {
  const { t } = useLanguage();
  const [detailData, setDetailData] = useState(emptyDetailData);

  useEffect(() => {
    let active = true;

    if (!customer) {
      return () => {
        active = false;
      };
    }

    getCustomerExtraData(customer)
      .then((data) => {
        if (!active) return;

        setDetailData({
          customerId: customer.id,
          invoices: data.invoices ?? [],
          subscription: data.subscription ?? null,
          recharges: data.recharges ?? [],
         });
      })
      .catch(() => {
        if (!active) return;

        setDetailData({
          customerId: customer.id,
          invoices: [],
          subscription: null,
          recharges: [],
        });
      });

    return () => {
      active = false;
    };
  }, [customer]);

  const loadingExtra = Boolean(customer) && detailData.customerId !== customer?.id;

  const detailedCustomer = useMemo(() => {
    if (!customer) return null;

    const product = detailData.subscription?.product ?? customer.subscription?.product;

    return {
      ...customer,
      invoices: detailData.customerId === customer.id ? detailData.invoices : (customer.invoices ?? []),
      subscription: detailData.customerId === customer.id ? detailData.subscription : customer.subscription,
      recharges: detailData.customerId === customer.id ? detailData.recharges : (customer.recharges ?? []),
      packageName: product?.name ?? customer.packageName,
    };
  }, [customer, detailData]);

  return (
    <Modal
      open={Boolean(customer)}
      title={customer?.name ?? t("customers_detail_title_fallback")}
      subtitle={customer ? t("customers_detail_subtitle", { id: customer.id }) : ""}
      onClose={onClose}
      width="640px"
      footer={
        <>
          <Button variant="dangerGhost" onClick={onDelete}>
            {t("button_delete")}
          </Button>
          <Button onClick={onEdit}>{t("button_update")}</Button>
          <Button variant="primary" onClick={onClose}>
            {t("button_close")}
          </Button>
        </>
      }
    >
      <CustomerDetail customer={detailedCustomer} loadingExtra={loadingExtra} />
    </Modal>
  );
}
