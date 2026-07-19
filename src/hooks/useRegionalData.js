/*
  HOOK: useRegionalData

  Bölgesel verinin yüklenmesini, loading durumunu ve hata mesajını yönetir.
  RegionalPage yalnızca bu hook'u çağırır; backend veya mock ayrıntısını bilmez.

  Veri akışı:
  RegionalPage -> useRegionalData -> regionalService -> Backend veya mock veri
*/

import { useCallback, useEffect, useState } from "react";
import { getRegionalData } from "../services/regionalService.js";

export default function useRegionalData() {
  // API'den gelen bölgesel obje. İlk yüklemede henüz veri olmadığı için null.
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kullanıcı "Tekrar dene" dediğinde veya component ilk açıldığında kullanılan yükleme fonksiyonu.
  const loadRegional = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const regionalData = await getRegionalData();
      setData(regionalData);
    } catch (requestError) {
      setError(requestError.message || "Bölgesel veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Component ilk kez açıldığında veriyi getirir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRegional();
  }, [loadRegional]);

  return {
    data,
    loading,
    error,
    reload: loadRegional,
  };
}
