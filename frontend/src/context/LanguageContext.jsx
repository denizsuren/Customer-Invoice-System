/* eslint-disable react-refresh/only-export-components */
/*
  CONTEXT: LanguageContext

  Uygulama genelinde dil durumunu (tr/en) yönetir.
  localStorage'da saklanır, böylece sayfa yenilense de tercih kaybolmaz.

  Kullanım:
  const { language, setLanguage, t, tv, locale } = useLanguage();
  <h1>{t("dashboard_title")}</h1>
  <Badge>{tv(customer.status)}</Badge>
*/

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, valueTranslations } from "../i18n/translations.js";

const STORAGE_KEY = "pia-language";
const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === "undefined") return "tr";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" || stored === "tr" ? stored : "tr";
}

function interpolate(template, params = {}) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function translateDynamicValue(value, language) {
  if (language !== "en" || typeof value !== "string") return value;

  const lateLowercase = value.match(/^(\d+) gün gecikti$/i);
  if (lateLowercase) return `${lateLowercase[1]} days late`;

  const lateUppercase = value.match(/^\+(\d+) Gün Gecikme$/i);
  if (lateUppercase) return `+${lateUppercase[1]} Days Late`;

  const delayChip = value.match(/^(3\+ kez) gecikme$/i);
  if (delayChip) return "3+ times delay";

  const overageInvoiceCount = value.match(/^(\d+) limit aşımı faturası$/i);
  if (overageInvoiceCount) return `${overageInvoiceCount[1]} overage invoices`;

  if (value === "Üst pakete geçir") return "Move to upper package";


  const packageLimitRecommendation = value.match(/^(\d+) müşteri paket limitini sık aşıyor, üst pakete geçiş önerisi sunulabilir$/i);
  if (packageLimitRecommendation) {
    return `${packageLimitRecommendation[1]} customers frequently exceed package limits and can be offered an upgrade.`;
  }

  const latePaymentRecommendation = value.match(/^(\d+) müşteri son 12 ayda 3 veya daha fazla kez ödemesini geciktirdi$/i);
  if (latePaymentRecommendation) {
    return `${latePaymentRecommendation[1]} customers delayed payment 3 or more times in the last 12 months.`;
  }

  const overdueInvoiceRecommendation = value.match(/^(\d+) fatura şu anda vadesi geçmiş ve ödenmemiş durumda$/i);
  if (overdueInvoiceRecommendation) {
    return `${overdueInvoiceRecommendation[1]} invoices are currently overdue and unpaid.`;
  }

  const failedRequest = value.match(/^(Dashboard|Analiz|Bölgesel veri|Fatura|İstek) isteği başarısız oldu \((\d+)\)\.$/i);
  if (failedRequest) {
    const requestNames = {
      Dashboard: "Dashboard",
      Analiz: "Analytics",
      "Bölgesel veri": "Regional data",
      Fatura: "Invoice",
      İstek: "Request",
    };

    return `${requestNames[failedRequest[1]] ?? "Request"} request failed (${failedRequest[2]}).`;
  }

  return value;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  // Tercih değiştikçe localStorage'a yazar ve <html lang="..."> attribute'unu günceller.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const value = useMemo(() => {
    const dictionary = translations[language] ?? translations.tr;
    const fallbackDictionary = translations.tr;
    const valueDictionary = valueTranslations[language] ?? {};

    // Anahtar sözlükte yoksa uygulamanın çökmemesi için anahtarın kendisini gösterir.
    const t = (key, params) => interpolate(dictionary[key] ?? fallbackDictionary[key] ?? key, params);

    /*
      Backend/mock veriden gelen Türkçe değerleri yalnızca ekranda çevirir.
      Select option value'ları ve filtre karşılaştırmaları Türkçe kalabilir;
      böylece veri modeli bozulmadan İngilizce görünüm elde edilir.
    */
    const tv = (rawValue) => {
      if (rawValue === null || rawValue === undefined) return rawValue;
      if (typeof rawValue !== "string") return rawValue;

      return valueDictionary[rawValue] ?? translateDynamicValue(rawValue, language);
    };

    return {
      language,
      locale: language === "en" ? "en-US" : "tr-TR",
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === "tr" ? "en" : "tr")),
      t,
      tv,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage, LanguageProvider içinde kullanılmalı.");
  }

  return context;
}
