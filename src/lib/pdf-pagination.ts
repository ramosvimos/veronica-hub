import { paramValue, type DirectoryParams } from "@/data/pdf-catalog";

export const PDF_PAGE_SIZE = 24;

export function pdfPagination(total: number, params?: DirectoryParams) {
  const totalPages = Math.max(1, Math.ceil(total / PDF_PAGE_SIZE));
  const raw = paramValue(params, "page");
  const requested = /^\d+$/.test(raw) ? Number(raw) : 1;
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(totalPages, requested) : 1;
  return { page, totalPages, pageSize: PDF_PAGE_SIZE };
}

export function pdfPagePath(pathname: string, page: number) {
  return page > 1 ? `${pathname}?page=${page}` : pathname;
}

export function pdfPageRedirect(pathname: string, total: number, params?: DirectoryParams) {
  if (!params || !("page" in params)) return null;
  const { page } = pdfPagination(total, params);
  const expected = page > 1 ? String(page) : "";
  if (typeof params.page === "string" && params.page === expected && expected) return null;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (typeof item === "string") query.append(key, item);
    }
  }
  if (expected) query.set("page", expected);
  return `${pathname}${query.size ? `?${query}` : ""}`;
}

export function pdfHasFilters(params?: DirectoryParams) {
  return ["q", "price", "processing", "sort", "category"].some(key => !!paramValue(params, key));
}
