/*
  HOOK: useDashboardData

  Dashboard verisinin yüklenmesini, loading durumunu ve hata mesajını yönetir.
  DashboardPage yalnızca bu hook'u çağırır; backend veya mock ayrıntısını bilmez.

  Veri akışı:
  DashboardPage -> useDashboardData -> dashboardService -> Backend veya mock veri
*/

import { useCallback, useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService.js";

export default function useDashboardData() {
  // API'den gelen dashboard objesi. İlk yüklemede henüz veri olmadığı için null.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kullanıcı "Tekrar dene" dediğinde kullanılacak manuel yenileme fonksiyonu.
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (requestError) {
      setError(requestError.message || "Dashboard verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Component ilk kez açıldığında veriyi getirir.
  useEffect(() => {
    // İstek tamamlanmadan sayfa değişirse artık state güncellememek için kullanılır.
    let active = true;

    getDashboardData()
      .then((dashboardData) => {
        if (active) setData(dashboardData);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Dashboard verileri yüklenemedi.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Component ekrandan kaldırıldığında active false olur.
    return () => {
      active = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    reload: loadDashboard,
  };
}
