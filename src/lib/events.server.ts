import { getSql } from "./db";

export async function exportEvents(filters: { from?: string; to?: string; neighbourhood?: string }) {
  const sql = await getSql();
  // For now return from store; later query events table
  return { events: [], filters };
}
