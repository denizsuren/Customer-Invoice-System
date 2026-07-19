// useState:
// Arama metni, açık modal ve seçili müşteri gibi değişebilen verileri tutar.
//
// useMemo:
// Arama sonucu oluşan müşteri listesini yalnızca customers veya search
// değiştiğinde tekrar hesaplar.
import { useEffect, useMemo, useState } from "react";

// Aktif filtreleri küçük chipler halinde gösterir.
import ActiveFilterChips from "../components/customers/ActiveFilterChips.jsx";

// Yeni müşteri ekleme formunun bulunduğu modal.
import AddCustomerModal from "../components/customers/AddCustomerModal.jsx";

// Tablodaki üç nokta butonuna basınca açılan işlem menüsü.
import CustomerActionsModal from "../components/customers/CustomerActionsModal.jsx";

// Seçilen müşterinin detaylarını gösteren modal.
import CustomerDetailModal from "../components/customers/CustomerDetailModal.jsx";

// Sayfa üzerinde sürekli görünen filtre alanları.
import CustomerFilters from "../components/customers/CustomerFilters.jsx";

// "Filtreler" butonuna basınca açılan gelişmiş filtre modalı.
import CustomerFiltersModal from "../components/customers/CustomerFiltersModal.jsx";

// Müşteri listesini tablo olarak gösterir.
import CustomerTable from "../components/customers/CustomerTable.jsx";

// Arama kutusu, Filtreler ve Müşteri Ekle butonlarını içerir.
import CustomerToolbar from "../components/customers/CustomerToolbar.jsx";

// Müşteri silmeden önce onay alınan modal.
import DeleteCustomerModal from "../components/customers/DeleteCustomerModal.jsx";

// Mevcut müşteri bilgilerini güncellemek için kullanılan modal.
import UpdateCustomerModal from "../components/customers/UpdateCustomerModal.jsx";

// Dil tercihine göre metinleri çevirir (tr/en).
import { useLanguage } from "../context/LanguageContext.jsx";

// Projede tekrar kullanılan genel buton componenti.
import Button from "../components/ui/Button.jsx";

// Başarı bildirimi için de kullanılan genel modal componenti.
import Modal from "../components/ui/Modal.jsx";

// API hatalarını sayfa üzerinde göstermek için kullanılır.
import StatusMessage from "../components/ui/StatusMessage.jsx";

// Müşterileri yükleme, ekleme, güncelleme ve silme işlemlerini yöneten custom hook.
import useCustomers from "../hooks/useCustomers.js";

import Pagination from "../components/ui/Pagination.jsx";

import { defaultCustomerFilters, updateCustomerFilters } from "../utils/customerFilter.js";

function parseCurrencyValue(value) {
  const normalized = String(value ?? "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function matchesMonthlyInvoiceRange(customer, selectedRange) {
  if (selectedRange === "Tümü") return true;

  const amount = parseCurrencyValue(customer.lastInvoice);

  if (selectedRange === "0 ₺ — 250 ₺") return amount >= 0 && amount <= 250;
  if (selectedRange === "250 ₺ — 500 ₺") return amount > 250 && amount <= 500;
  if (selectedRange === "500 ₺+") return amount > 500;

  return true;
}

export default function CustomersPage() {
  // Arayüz metinlerini seçili dile göre döndürür.
  const { locale, t, tv } = useLanguage();


  /*
    useCustomers hook'undan müşteri verilerini ve backend işlemlerini alıyoruz.

    customers:
    Güncel müşteri listesi.

    loading:
    İlk müşteri yükleme işlemi devam ediyor mu?

    error:
    Yükleme, ekleme, güncelleme veya silme sırasında oluşan hata mesajı.

    pendingAction:
    Şu anda devam eden işlemi tutar:
    "create", "update", "delete" veya boş string.

    reload:
    Müşteri listesini backend'den yeniden yükler.

    addCustomer:
    Yeni müşteri ekler.

    updateCustomer:
    Mevcut müşteriyi günceller.

    removeCustomer:
    Müşteriyi siler.
  */
  const {
    customers,
    loading,
    error,
    pendingAction,
    page,
    totalPages,
    totalElements,
    applyFilters,
    goToPage,
    reload,
    addCustomer,
    updateCustomer,
    removeCustomer,
  } = useCustomers();

  /*
    Arama kutusundaki metni tutar.

    Bu değer CustomerToolbar componentine gönderilir.
    Kullanıcı arama kutusuna yazdıkça setSearch çalışır.
  */
  const [search, setSearch] = useState("");

  /*
    Ekranda gösterilen aktif filtre chiplerini tutar.

    DİKKAT:
    Şu an bu chipler yalnızca görsel olarak eklenip kaldırılıyor.
    filteredCustomers hesabında kullanılmadıkları için tabloyu gerçekten filtrelemiyorlar.

    Gerçek filtreleme yapılacaksa bu değerlerin aşağıdaki
    filteredCustomers useMemo'suna dahil edilmesi gerekir.
  */
  const [filters, setFilters] = useState(defaultCustomerFilters);
  const [draftFilters, setDraftFilters] = useState(defaultCustomerFilters);

  /*
    Detay modalında gösterilecek müşterinin ID'si.

    null:
    Detay modalı kapalı.

    Bir müşteri ID'si:
    O müşterinin detay modalı açık.
  */
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  /*
    Üç nokta işlem menüsü açılan müşterinin ID'si.

    null olduğunda CustomerActionsModal kapalıdır.
  */
  const [menuCustomerId, setMenuCustomerId] = useState(null);

  /*
    Güncelleme modalında düzenlenecek müşterinin ID'si.

    null olduğunda UpdateCustomerModal kapalıdır.
  */
  const [editCustomerId, setEditCustomerId] = useState(null);

  /*
    Silme onay modalında gösterilecek müşterinin ID'si.

    null olduğunda DeleteCustomerModal kapalıdır.
  */
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  /*
    Gelişmiş filtre modalının açık olup olmadığını tutar.

    true  -> Modal açık
    false -> Modal kapalı
  */
  const [filtersOpen, setFiltersOpen] = useState(false);

  /*
    Yeni müşteri ekleme modalının açık olup olmadığını tutar.
  */
  const [addOpen, setAddOpen] = useState(false);

  /*
    Ekleme, güncelleme veya silme başarılı olduğunda
    gösterilecek başarı mesajını tutar.

    Örnek:
    {
      title: "Müşteri güncellendi",
      message: "Ahmet Yılmaz bilgileri kaydedildi."
    }

    null olduğunda başarı modalı kapalıdır.
  */
  const [notice, setNotice] = useState(null);

  /*
    Bir müşteri ID'sini kullanarak customers listesinden
    ilgili müşteri objesini bulur.

    Müşteri bulunamazsa null döndürür.

    Bu yardımcı fonksiyon sayesinde her modal için tekrar tekrar
    customers.find(...) yazmak zorunda kalmıyoruz.
  */
  const customerById = (id) => customers.find((customer) => customer.id === id) ?? null;

  // Detay modalında gösterilecek müşteri.
  const selectedCustomer = customerById(selectedCustomerId);

  // Üç nokta işlem menüsünde seçili müşteri.
  const menuCustomer = customerById(menuCustomerId);

  // Güncelleme modalında düzenlenecek müşteri.
  const editCustomer = customerById(editCustomerId);

  // Silme onay modalında gösterilecek müşteri.
  const customerToDelete = customerById(deleteCustomerId);

  const riskyCustomerCount = useMemo(
    () => customers.filter((customer) => customer.tag === "Riskli").length,
    [customers],
  );

  const activeFilterChips = useMemo(
    () =>
      [
        filters.lineType !== "Tümü" ? { key: "lineType", label: tv(filters.lineType) } : null,
        filters.tag !== "Tümü" ? { key: "tag", label: tv(filters.tag) } : null,
        filters.city !== "Tümü" ? { key: "city", label: tv(filters.city) } : null,
        filters.delay !== "Tümü" ? { key: "delay", label: tv(`${filters.delay} gecikme`) } : null,
        filters.monthlyInvoice !== "Tümü"
          ? { key: "monthlyInvoice", label: tv(filters.monthlyInvoice) }
          : null,
      ].filter(Boolean),
    [filters, tv],
  );

  /*
    Arama kutusundaki metne göre gösterilecek müşteri listesini hesaplar.

    useMemo sayesinde bu filtreleme işlemi yalnızca:
    - customers listesi değiştiğinde
    - search değeri değiştiğinde
    tekrar çalışır.
  */
  const filteredCustomers = useMemo(() => {
      return customers.filter((customer) => {
        // Etiket artık sunucuda filtrelenir (riskCategory); yerelde ikinci kez
        // elenirse sayfalama sayıları tabloyla çelişir.
        const matchesMonthlyInvoice = matchesMonthlyInvoiceRange(customer, filters.monthlyInvoice);

        return matchesMonthlyInvoice;
      });
    }, [customers, filters]);

  useEffect(() => {
      applyFilters({
        search,
        lineType: filters.lineType,
        city: filters.city,
        delay: filters.delay,
        tag: filters.tag,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, filters.lineType, filters.city, filters.delay, filters.tag]);

  /*filter additions*/
  const handleFilterChange = (name, value) => {
    setFilters((current) => updateCustomerFilters(current, name, value));
  };

  const handleDraftFilterChange = (name, value) => {
    setDraftFilters((current) => updateCustomerFilters(current, name, value));
  };

  const openFiltersModal = () => {
    setDraftFilters(filters);
    setFiltersOpen(true);
  };

  const applyDraftFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const removeFilterChip = (key) => {
    handleFilterChange(key, "Tümü");
  };

  /*
    Müşteri güncelleme modalını açar.

    Önce detay ve işlem menüsünü kapatır.
    Ardından düzenlenecek müşterinin ID'sini editCustomerId'ye yazar.
  */
  const openEdit = (customer) => {
    setSelectedCustomerId(null);
    setMenuCustomerId(null);
    setEditCustomerId(customer.id);
  };

  /*
    Müşteri silme onay modalını açar.

    Önce detay ve işlem menüsünü kapatır.
    Ardından silinecek müşterinin ID'sini state'e yazar.
  */
  const openDelete = (customer) => {
    setSelectedCustomerId(null);
    setMenuCustomerId(null);
    setDeleteCustomerId(customer.id);
  };

  /*
    Yeni müşteri formu gönderildiğinde çalışır.

    form:
    AddCustomerModal içindeki CustomerForm'dan gelen müşteri bilgileri.
  */
  const handleAdd = async (form) => {
    try {
      // useCustomers içindeki addCustomer backend isteğini çalıştırır.
      const customer = await addCustomer(form);

      // İşlem başarılıysa ekleme modalını kapatır.
      setAddOpen(false);

      // Başarı modalında gösterilecek mesajı oluşturur.
      setNotice({
        title: t("customers_notice_add_title"),
        message: t("customers_notice_add_message", { name: customer.name }),
      });
    } catch {
      /*
        Hata burada tekrar gösterilmiyor.

        addCustomer içindeki hata useCustomers tarafından
        error state'ine yazıldığı için sayfanın üstündeki
        StatusMessage componentinde görüntülenir.
      */
    }
  };

  /*
    Müşteri güncelleme formu gönderildiğinde çalışır.
  */
  const handleUpdate = async (form) => {
    // Güncellenecek müşteri bulunmuyorsa işlem yapmaz.
    if (!editCustomer) return;

    try {
      /*
        Güncellenecek müşterinin ID'si ve yeni form bilgileri
        updateCustomer fonksiyonuna gönderilir.
      */
      const customer = await updateCustomer(editCustomer.id, form);

      // Güncelleme başarılıysa modalı kapatır.
      setEditCustomerId(null);

      // Başarı mesajını açar.
      setNotice({
        title: t("customers_notice_update_title"),
        message: t("customers_notice_update_message", { name: customer.name }),
      });
    } catch {
      // Hata useCustomers hook'undaki error state'i üzerinden gösterilir.
    }
  };

  /*
    Silme onay modalındaki "Müşteriyi sil" butonuna basıldığında çalışır.
  */
  const handleDelete = async () => {
    // Silinecek müşteri bulunmuyorsa işlem yapmaz.
    if (!customerToDelete) return;

    try {
      /*
        Müşteri silindikten sonra customerToDelete değeri kaybolabileceği için
        başarı mesajında kullanılacak adı önceden saklıyoruz.
      */
      const deletedName = customerToDelete.name;

      // Backend üzerinden müşteriyi siler.
      await removeCustomer(customerToDelete.id);

      // Silme başarılıysa onay modalını kapatır.
      setDeleteCustomerId(null);

      // Başarı mesajını gösterir.
      setNotice({
        title: t("customers_notice_delete_title"),
        message: t("customers_notice_delete_message", { name: deletedName }),
      });
    } catch {
      // Silme hatası useCustomers tarafından error state'ine yazılır.
    }
  };

  return (
    /*
      page-content:
      Sayfadaki başlık, toolbar, filtreler ve tablo arasındaki
      dikey boşlukları kontrol eder.

      Tasarım:
      layout.css -> `.page-content`
    */
    <section className="page-content">
      {/*
        Sayfanın ana başlık alanı.

        Tasarım:
        layout.css -> `.page-heading`
      */}
      <div className="page-heading">
        <h1>{t("customers_title")}</h1>

        <p>
          {/*
            customers.length:
            Backend'den gelen toplam müşteri sayısı.

            toLocaleString("tr-TR"):
            2418 değerini 2.418 şeklinde gösterir.
          */}
          {t("customers_summary", {
            count: totalElements.toLocaleString(locale),
            riskyCount: riskyCustomerCount.toLocaleString(locale),
          })}
        </p>
      </div>

      {/*
        Bir backend hatası varsa kırmızı hata kutusu gösterilir.

        "Tekrar dene" butonu reload fonksiyonunu çağırarak
        müşterileri yeniden yüklemeyi dener.
      */}
      {error ? (
        <StatusMessage tone="danger" action={<Button onClick={reload}>{t("button_retry")}</Button>}>
          {tv(error)}
        </StatusMessage>
      ) : null}

      {/*
        Arama kutusu ve üst işlem butonları.

        onSearch:
        Kullanıcı yazdıkça search state'ini günceller.

        onOpenFilters:
        Gelişmiş filtre modalını açar.

        onAddCustomer:
        Yeni müşteri modalını açar.
      */}
      <CustomerToolbar
        search={search}
        onSearch={setSearch}
        onOpenFilters={openFiltersModal}
        onAddCustomer={() => setAddOpen(true)}
      />

      {/*
        Sayfa üzerinde görünen beşli filtre paneli.

        Şu an bu componentteki selectler gerçek filtreleme yapıyor.
      */}
      <CustomerFilters filters={filters} onChange={handleFilterChange} />

      {/*
        Aktif filtre chiplerini ve filtrelenmiş sonuç sayısını gösterir.

        Tek bir chip'e basıldığında yalnızca o chip listeden kaldırılır.
        Temizle butonuna basıldığında bütün chipler silinir.
      */}
      <ActiveFilterChips
        chips={activeFilterChips}
        resultCount={filteredCustomers.length}
        onRemove={removeFilterChip}
        onClear={() =>
          setFilters({
            ...defaultCustomerFilters,
            delay: "Tümü",
          })
        }
      />

      {/*
        Arama sonucuna göre filtrelenen müşterileri tablo halinde gösterir.

        Bir satıra basıldığında:
        selectedCustomerId ayarlanır ve detay modalı açılır.

        Üç noktaya basıldığında:
        menuCustomerId ayarlanır ve işlem menüsü açılır.
      */}
      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        onOpenCustomer={(customer) => setSelectedCustomerId(customer.id)}
        onOpenMenu={(customer) => setMenuCustomerId(customer.id)}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={goToPage}
       />

      {/*
        Gelişmiş filtre modalı.

        filtersOpen true olduğunda açılır.
      */}
      <CustomerFiltersModal
        open={filtersOpen}
        filters={draftFilters}
        onChange={handleDraftFilterChange}
        onClose={() => setFiltersOpen(false)}
        onApply={applyDraftFilters}
      />

      {/*
        Yeni müşteri ekleme modalı.

        pendingAction === "create":
        Backend'e müşteri ekleme isteğinin devam ettiğini gösterir.
        Bu sırada form butonu disabled olur ve "Kaydediliyor…" yazar.
      */}
      <AddCustomerModal
        open={addOpen}
        submitting={pendingAction === "create"}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      {/*
        Müşteri detay modalı.

        selectedCustomer null değilse açılır.

        Güncelle butonu openEdit'i,
        Sil butonu openDelete'i çağırır.
      */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomerId(null)}
        onEdit={() => selectedCustomer && openEdit(selectedCustomer)}
        onDelete={() => selectedCustomer && openDelete(selectedCustomer)}
      />

      {/*
        Tablodaki üç nokta işlem menüsü.

        "Müşteri detayını aç":
        İşlem menüsünü kapatır ve detay modalını açar.

        "Güncelle":
        openEdit üzerinden güncelleme modalını açar.

        "Sil":
        openDelete üzerinden silme onay modalını açar.
      */}
      <CustomerActionsModal
        customer={menuCustomer}
        onClose={() => setMenuCustomerId(null)}
        onOpenDetail={() => {
          // Seçili müşteri yoksa işlem yapmaz.
          if (!menuCustomer) return;

          // Detay modalında gösterilecek müşteriyi seçer.
          setSelectedCustomerId(menuCustomer.id);

          // Üç nokta işlem menüsünü kapatır.
          setMenuCustomerId(null);
        }}
        onEdit={() => menuCustomer && openEdit(menuCustomer)}
        onDelete={() => menuCustomer && openDelete(menuCustomer)}
      />

      {/*
        Müşteri güncelleme modalı.

        editCustomer doluysa modal açılır.
        Güncelleme isteği sürerken submitting true olur.
      */}
      <UpdateCustomerModal
        customer={editCustomer}
        submitting={pendingAction === "update"}
        onClose={() => setEditCustomerId(null)}
        onSubmit={handleUpdate}
      />

      {/*
        Müşteri silme onay modalı.

        customerToDelete doluysa açılır.
        Silme isteği sürerken deleting true olur.
      */}
      <DeleteCustomerModal
        customer={customerToDelete}
        deleting={pendingAction === "delete"}
        onClose={() => setDeleteCustomerId(null)}
        onConfirm={handleDelete}
      />

      {/*
        Ekleme, güncelleme veya silme başarılı olduğunda
        gösterilen genel başarı modalı.

        Boolean(notice):
        notice objesi varsa true olur ve modal açılır.

        notice null olduğunda modal kapanır.
      */}
      <Modal
        open={Boolean(notice)}
        title={notice?.title ?? t("customers_notice_default_title")}
        subtitle={notice?.message}
        onClose={() => setNotice(null)}
        width="420px"
        footer={
          <Button variant="primary" onClick={() => setNotice(null)}>
            {t("button_ok")}
          </Button>
        }
      >
        {/*
          Başarı modalının ortasındaki yuvarlak tik.

          Tasarım:
          customers.css -> `.success-symbol`
        */}
        <div className="success-symbol">✓</div>
      </Modal>
    </section>
  );
}
