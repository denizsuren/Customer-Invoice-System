import { useCallback, useEffect, useState } from "react";
import {
  createCustomer as createCustomerRequest,
  deleteCustomer as deleteCustomerRequest,
  getCustomers,
  updateCustomer as updateCustomerRequest,
} from "../services/customerService.js";

const PAGE_SIZE = 20;

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [queryParams, setQueryParams] = useState({
    search: "",
    lineType: "Tümü",
    city: "Tümü",
    delay: "Tümü",
    tag: "Tümü",
  });

  const loadCustomers = useCallback(async (targetPage, params) => {
    setLoading(true);
    setError("");

    try {
      const result = await getCustomers({ page: targetPage, size: PAGE_SIZE, ...params });
      setCustomers(result.items);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.page);
    } catch (requestError) {
      setError(requestError.message || "Müşteriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCustomers(0, queryParams);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arama kutusu ya da sunucu-taraflı filtreler değiştiğinde çağrılır; her zaman 1. sayfaya döner.
  const applyFilters = useCallback(
    (nextParams) => {
      setQueryParams(nextParams);
      loadCustomers(0, nextParams);
    },
    [loadCustomers],
  );

  const goToPage = useCallback(
    (nextPage) => {
      if (nextPage < 0 || nextPage >= totalPages) return;
      loadCustomers(nextPage, queryParams);
    },
    [loadCustomers, totalPages, queryParams],
  );

  const runMutation = useCallback(async (actionName, request) => {
    setPendingAction(actionName);
    setError("");

    try {
      return await request();
    } catch (requestError) {
      setError(requestError.message || "İşlem tamamlanamadı.");
      throw requestError;
    } finally {
      setPendingAction("");
    }
  }, []);

  const addCustomer = useCallback(
    async (input) => {
      const customer = await runMutation("create", () => createCustomerRequest(input));
      await loadCustomers(0, queryParams);
      return customer;
    },
    [runMutation, loadCustomers, queryParams],
  );

  const updateCustomer = useCallback(
    async (id, input) => {
      const customer = await runMutation("update", () => updateCustomerRequest(id, input));
      await loadCustomers(page, queryParams);
      return customer;
    },
    [runMutation, loadCustomers, page, queryParams],
  );

  const removeCustomer = useCallback(
    async (id) => {
      await runMutation("delete", () => deleteCustomerRequest(id));
      await loadCustomers(page, queryParams);
    },
    [runMutation, loadCustomers, page, queryParams],
  );

  return {
    customers,
    loading,
    error,
    pendingAction,
    page,
    totalPages,
    totalElements,
    applyFilters,
    goToPage,
    reload: () => loadCustomers(page, queryParams),
    addCustomer,
    updateCustomer,
    removeCustomer,
  };
}
