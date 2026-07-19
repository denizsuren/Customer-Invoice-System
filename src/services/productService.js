/*
  DOSYA: productService.js

  Müşteri ekleme/güncelleme formunda gösterilecek paket seçeneklerini backend
  product tablosundan çeker. Böylece kullanıcı serbest paket adı yazmaz; yalnızca
  gerçek Product kayıtlarından seçim yapar.
*/

import { apiRequest, getListFromResponse, isApiEnabled } from "./apiClient.js";

let cachedProducts = null;

export async function getProducts() {
  if (!isApiEnabled()) return [];

  if (!cachedProducts) {
    cachedProducts = apiRequest("/products").then(getListFromResponse);
  }

  return cachedProducts;
}

export function clearProductCache() {
  cachedProducts = null;
}
