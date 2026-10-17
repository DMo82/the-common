import { getSql } from "./db";

export async function getKPIs() {
  const sql = await getSql();
  // Placeholder until sessions table exists
  return {
    dau: 124,
    mau: 1847,
    topArticles: 12,
    activeCategories: 8,
  };
}

export async function getSummary() {
  const sql = await getSql();
  // Placeholder until we have user/business/event counts
  return {
    users: { total: 156, byNeighbourhood: { Clapham: 45, Brixton: 38, Streatham: 32 } },
    businesses: { total: 24, byNeighbourhood: { Clapham: 8, Brixton: 6, Streatham: 5 } },
    events: { total: 18, byNeighbourhood: { Clapham: 6, Brixton: 5, Streatham: 4 } },
    listings: { total: 42, byNeighbourhood: { Clapham: 14, Brixton: 12, Streatham: 10 } },
  };
}
