/*
  DOSYA: turkeyCities.js

  Müşteri formundaki şehir seçimi ve müşteri filtrelerindeki şehir/bölge
  seçenekleri burada tutulur.

  Frontend kullanıcıya 81 ili gösterir; backend ise bazı şehirleri tekil bölge,
  bazılarını "Diğer Büyükşehirler" veya "Kırsal ve Küçük İller" grubu olarak
  saklayabilir. Bu dosyadaki helper fonksiyonlar bu iki modeli birbirine bağlar.
*/

export const TURKEY_CITIES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
];

export const CUSTOMER_REGION_FILTER_OPTIONS = [
  "Tümü",
  "İstanbul",
  "Ankara",
  "İzmir",
  "Antalya",
  "Bursa",
  "Diğer Büyükşehirler",
  "Kırsal ve Küçük İller",
];

const DIRECT_REGION_CITIES = new Set(["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa"]);

const OTHER_METROPOLITAN_CITIES = new Set([
  "Adana",
  "Aydın",
  "Balıkesir",
  "Denizli",
  "Diyarbakır",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Hatay",
  "Kahramanmaraş",
  "Kayseri",
  "Kocaeli",
  "Konya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Ordu",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Tekirdağ",
  "Trabzon",
  "Van",
]);

export function normalizeCityText(value) {
  return String(value ?? "")
    .trim()
    .replaceAll("_", " ")
    .replaceAll("ı", "i")
    .replaceAll("İ", "I")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function getCustomerRegionGroup(city) {
  if (DIRECT_REGION_CITIES.has(city)) return city;
  if (OTHER_METROPOLITAN_CITIES.has(city)) return "Diğer Büyükşehirler";
  return "Kırsal ve Küçük İller";
}

export function normalizeBackendRegionName(value) {
  const normalized = normalizeCityText(value);

  if (normalized.includes("ISTANBUL")) return "İstanbul";
  if (normalized.includes("ANKARA")) return "Ankara";
  if (normalized.includes("IZMIR")) return "İzmir";
  if (normalized.includes("ANTALYA")) return "Antalya";
  if (normalized.includes("BURSA")) return "Bursa";
  if (normalized.includes("DIGER") || normalized.includes("BUYUKSEHIR")) {
    return "Diğer Büyükşehirler";
  }
  if (normalized.includes("KIRSAL") || normalized.includes("KUCUK") || normalized.includes("ILLER")) {
    return "Kırsal ve Küçük İller";
  }

  return value || "—";
}

export function getRegionLookupNamesForCity(city) {
  const group = getCustomerRegionGroup(city);

  if (group === "Diğer Büyükşehirler") {
    return ["Diğer Büyükşehirler", "Diger Buyuksehirler", "Diğer Buyuksehirler"];
  }

  if (group === "Kırsal ve Küçük İller") {
    return ["Kırsal ve Küçük İller", "Kirsal ve Kucuk Iller", "Kırsal ve Kucuk Iller"];
  }

  return [group];
}
