/*
  HOOK: useAnalyticsData

  Analizler verisinin yüklenmesini, loading durumunu ve hata mesajını yönetir.
  AnalyticsPage yalnızca bu hook'u çağırır; backend veya mock ayrıntısını bilmez.

  Veri akışı:
  AnalyticsPage -> useAnalyticsData -> analyticsService -> Backend veya mock veri
*/

import { useCallback, useEffect, useState } from "react";
import { getAnalyticsData } from "../services/analyticsService.js";

export default function useAnalyticsData() {
  // API'den gelen analiz objesi. İlk yüklemede henüz veri olmadığı için null.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kullanıcı "Tekrar dene" dediğinde veya component ilk açıldığında kullanılan yükleme fonksiyonu.
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const analyticsData = await getAnalyticsData();
      setData(analyticsData);
    } catch (requestError) {
      setError(requestError.message || "Analiz verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Component ilk kez açıldığında veriyi getirir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    data,
    loading,
    error,
    reload: loadAnalytics,
  };
}
