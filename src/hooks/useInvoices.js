import { useCallback, useEffect, useState } from "react";
import {
  createInvoice as createInvoiceRequest,
  deleteInvoice as deleteInvoiceRequest,
  getInvoices,
  updateInvoice as updateInvoiceRequest,
} from "../services/invoiceService";

const PAGE_SIZE = 20;

export default function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [searchParams, setSearchParams] = useState({ query: "", status: "" });

  const loadInvoices = useCallback(async (targetPage, params) => {
    setLoading(true);
    setError("");

    try {
      const result = await getInvoices(targetPage, PAGE_SIZE, params);
      setInvoices(result.items);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setPage(result.page);
    } catch (requestError) {
      setError(requestError.message || "Faturalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadInvoices(0, searchParams);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = useCallback(
    (nextParams) => {
      setSearchParams(nextParams);
      loadInvoices(0, nextParams);
    },
    [loadInvoices],
  );

  const goToPage = useCallback(
    (nextPage) => {
      if (nextPage < 0 || nextPage >= totalPages) return;
      loadInvoices(nextPage, searchParams);
    },
    [loadInvoices, totalPages, searchParams],
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

  const addInvoice = useCallback(
    async (input) => {
      const { customerId, ...rest } = input;
      const invoice = await runMutation("create", () => createInvoiceRequest(customerId, rest));
      await loadInvoices(0, searchParams);
      return invoice;
    },
    [runMutation, loadInvoices, searchParams],
  );

  const editInvoice = useCallback(
    async (customerId, invoiceId, input) => {
      const invoice = await runMutation("update", () => updateInvoiceRequest(customerId, invoiceId, input));
      await loadInvoices(page, searchParams);
      return invoice;
    },
    [runMutation, loadInvoices, page, searchParams],
  );

  const removeInvoice = useCallback(
    async (customerId, invoiceId) => {
      await runMutation("delete", () => deleteInvoiceRequest(customerId, invoiceId));
      await loadInvoices(page, searchParams);
    },
    [runMutation, loadInvoices, page, searchParams],
  );

  return {
    invoices,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    pendingAction,
    search,
    goToPage,
    reload: () => loadInvoices(page, searchParams),
    addInvoice,
    editInvoice,
    removeInvoice,
  };
}
