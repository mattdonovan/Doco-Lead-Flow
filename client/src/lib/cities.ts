export const SERVICE_AREA = [
  "Albertville", "Andover", "Anoka", "Becker", "Big Lake", "Blaine",
  "Brooklyn Center", "Brooklyn Park", "Buffalo", "Champlin", "Coon Rapids",
  "Crystal", "Dayton", "Delano", "Elk River", "Golden Valley", "Hamel",
  "Howard Lake", "Loretto", "Maple Grove", "Medina", "Monticello",
  "New Hope", "Osseo", "Otsego", "Plymouth", "Ramsey", "Robbinsdale",
  "Rogers", "St. Michael", "Watertown", "Waverly",
];

export const SURROUNDING_AREA = [
  "Afton", "Apple Valley", "Bayport", "Belle Plaine", "Bloomington",
  "Burnsville", "Cambridge", "Cannon Falls", "Carver", "Chanhassen",
  "Chaska", "Cottage Grove", "East Bethel", "Eagan", "Eden Prairie",
  "Edina", "Excelsior", "Farmington", "Forest Lake", "Fridley",
  "Hopkins", "Hugo", "Lake Elmo", "Lakeville", "Lino Lakes",
  "Mahtomedi", "Maplewood", "Minnetonka", "Mound", "Newport",
  "North Branch", "Northfield", "Oak Park Heights", "Oakdale",
  "Prior Lake", "Richfield", "Rosemount", "Roseville", "Savage",
  "Shakopee", "Shorewood", "Spring Lake Park", "St. Louis Park",
  "St. Paul", "Stacy", "Stillwater", "Victoria", "Waconia",
  "Wayzata", "White Bear Lake", "Woodbury", "Wyoming",
];

export const ALL_CITIES = [
  ...SERVICE_AREA.map(c => ({ name: c, type: "service" as const })),
  ...SURROUNDING_AREA.map(c => ({ name: c, type: "surrounding" as const })),
].sort((a, b) => a.name.localeCompare(b.name));

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function fuzzyMatchCities(input: string): { exact: typeof ALL_CITIES; fuzzy: typeof ALL_CITIES } {
  const q = input.trim().toLowerCase();
  if (!q) return { exact: [], fuzzy: [] };
  const exact = ALL_CITIES.filter(c => c.name.toLowerCase().startsWith(q));
  if (exact.length > 0) return { exact, fuzzy: [] };
  const threshold = Math.max(2, Math.floor(q.length * 0.4));
  const scored = ALL_CITIES
    .map(c => {
      const name = c.name.toLowerCase();
      const sub = name.slice(0, q.length);
      const dist = levenshtein(q, sub);
      const fullDist = levenshtein(q, name);
      return { city: c, dist: Math.min(dist, fullDist) };
    })
    .filter(s => s.dist <= threshold)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);
  return { exact: [], fuzzy: scored.map(s => s.city) };
}
