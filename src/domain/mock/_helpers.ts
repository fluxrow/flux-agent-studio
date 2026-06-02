/**
 * Helpers shared by every mock repository. Keep them tiny — they only
 * exist to make the in-memory adapter behave a little more like an API.
 */

export const delay = <T>(value: T, ms = 0): Promise<T> =>
  ms > 0 ? new Promise((r) => setTimeout(() => r(value), ms)) : Promise.resolve(value);

export const paginate = <T>(items: T[], page = 1, pageSize = 50) => ({
  items: items.slice((page - 1) * pageSize, page * pageSize),
  total: items.length,
  page,
  pageSize,
});

export const filterBySearch = <T extends Record<string, unknown>>(
  items: T[],
  search: string | undefined,
  fields: (keyof T)[],
): T[] => {
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter((it) =>
    fields.some((f) => String(it[f] ?? "").toLowerCase().includes(q)),
  );
};
