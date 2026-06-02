/**
 * Common primitives shared across all FluxBot domains.
 * Kept framework-agnostic so they can move 1:1 to a Supabase schema later.
 */

export type ID = string;
export type ISODate = string; // ISO-8601 date string, e.g. "2026-06-02T14:30:00Z"

export interface Timestamps {
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
