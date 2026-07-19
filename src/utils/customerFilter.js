export const defaultCustomerFilters = {
  lineType: "Tümü",
  tag: "Tümü",
  city: "Tümü",
  delay: "Tümü",
  monthlyInvoice: "Tümü",
};

export function getTagOptions(lineType, includeAll = true) {
  const options =
    lineType === "Faturalı"
      ? ["Riskli", "Güvenilir"]
      : lineType === "Faturasız"
        ? ["Aktif", "Pasif"]
        : ["Riskli", "Güvenilir", "Aktif", "Pasif"];

  return includeAll ? ["Tümü", ...options] : options;
}

export function updateCustomerFilters(current, name, value) {
  if (name !== "lineType") {
    return { ...current, [name]: value };
  }

  const nextTagOptions = getTagOptions(value);

  return {
    ...current,
    lineType: value,
    tag: nextTagOptions.includes(current.tag) ? current.tag : "Tümü",
  };
}

export function getCustomerTagTone(tag) {
  if (tag === "Riskli") return "danger";
  if (tag === "Güvenilir") return "success";
  if (tag === "Aktif") return "active";
  if (tag === "Pasif") return "inactive";
  return "neutral";
}
